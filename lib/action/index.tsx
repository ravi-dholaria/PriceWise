"use server";
import { get } from "http";
import Product from "../models/product.model";
import { connectToDatabase } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper/index";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { revalidatePath } from "next/cache";
import { generateKey } from "crypto";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { User } from "@/types";
import { Console } from "console";

//write a export async function scrapeandstoreproduct
export async function scrapeandstoreproduct(ProductUrl: string) {
  if (!ProductUrl) {
    return;
  }
  try {
    connectToDatabase();

    const scrapedProduct = await scrapeAmazonProduct(ProductUrl);

    if (!scrapedProduct) return;

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    console.log("Scraped Product: ", product);
    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { new: true, upsert: true }
    );

    const AllProducts = await Product.find({});
    console.log("All Products: ", AllProducts);

    revalidatePath(`/product/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to scrape and store product: ${error.message}`);
  }
}

export async function getproductbyid(ProductId: string) {
  try {
    connectToDatabase();

    const product = await Product.findById(ProductId);

    if (!product) {
      return;
    }

    return product;
  } catch (error: any) {
    throw new Error(`Failed to get product by id: ${error.message}`);
  }
}

export async function getallproducts() {
  try {
    connectToDatabase();

    const products = await Product.find({});

    if (!products) {
      return;
    }

    return products;
  } catch (error: any) {
    throw new Error(`Failed to get all products: ${error.message}`);
  }
}

export async function getSimilarProduct(ProductId: string) {
  try {
    connectToDatabase();

    const product = await Product.findById(ProductId);

    if (!product) {
      return;
    }

    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: ProductId },
    });

    return similarProducts;
  } catch (error: any) {
    throw new Error(`Failed to get similar products: ${error.message}`);
  }
}

export async function addUserEmailToProduct(ProductId: string, email: string) {
  try {
    connectToDatabase();
    const product = await Product.findById(ProductId);

    if (!product) {
      return;
    }

    const userExists = product.users.some((user: User) => user.email === email);

    console.log("User Exists: ", userExists);

    if (!userExists) {
      product.users.push({ email });
      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");
      await sendEmail(emailContent, [email]);
    }
  } catch (error: any) {
    throw new Error(`Failed to add user email to product: ${error.message}`);
  }
}
