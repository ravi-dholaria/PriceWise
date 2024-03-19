import axios from "axios";
import * as cheerio from "cheerio";
import { extractCurrency, extractDescription, extractPrice } from "../utils";
import { parse } from "path";

export async function scrapeAmazonProduct(url: string) {
  if (!url) return;

  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const sessionId = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${username}-session-${sessionId}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };
  try {
    //fetch the product details
    const response = await axios.get(url, options);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    const currentPrice = extractPrice(
      $(".priceToPay span.a-price-whole"),
      $(".a.size.base.a-color-price"),
      $(".a-button-selected .a-color-base")
    );

    const originalPrice = extractPrice(
      $("#priceblock_ourprice"),
      $(".a-price.a-text-price span.a-offscreen"),
      $("#listPrice"),
      $("#priceblock_dealprice"),
      $(".a-size-base.a-color-price")
    );

    const outOfStock = $("#availability span.a-declarative")
      .text()
      .trim()
      .toLowerCase()
      .includes("Currently unavailable".toLowerCase());

    const images =
      $("#landingImage").attr("data-a-dynamic-image") ||
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      "{}";

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($(".a-price-symbol"));

    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");

    let ratingCounts = $("#acrCustomerReviewText")
      .text()
      .trim()
      .replace(/[^0-9.]/g, "");

    ratingCounts = ratingCounts.substring(0, ratingCounts.length / 2);

    console.log("RatingCounts=>>", ratingCounts);

    const ratings = $(".a-size-base", "#acrPopover")
      .text()
      .trim()
      .split(" ")[0]
      .replace(/[^0-9.]/g, "");

    const description = extractDescription(
      $(".a-list-item", "#feature-bullets")
    );

    //Construct data object with scraped information
    const data = {
      url,
      title,
      currentPrice: Number(currentPrice),
      originalPrice: Number(originalPrice),
      priceHistory: [],
      isOutOfStock: outOfStock,
      image: imageUrls[0],
      currency,
      category: "category",
      discountRate: Number(discountRate),
      description,
      ratings: parseFloat(ratings),
      reviewsCount: Number(ratingCounts),
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    };

    console.log(data);
    return data;
  } catch (error: any) {
    throw new Error(`Failed to scrape Amazon product: ${error.message}`);
  }
}
