const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const otpGenerator = require("otp-generator");
const { JWT_SECRET, JWT_EXPIRES_IN, ENCRYPTION_KEY } = process.env;
const axios = require("axios");
const cheerio = require("cheerio");

const successHandler = (res, data, message, status) => {
  res.status(status || 200).send({
    status: "success",
    message: message,
    data: data,
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const comparePassword = async (plainPassword, encryptedPassword) => {
  return await bcrypt.compare(plainPassword, encryptedPassword);
};

const decrypt = (encryptedText) => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");
};

const generateOtp = (
  length = 6,
  digits = true,
  specialChars = false,
  upperCaseAlphabets = false,
  lowerCaseAlphabets = false
) => {
  return otpGenerator.generate(length, {
    digits,
    specialChars,
    upperCaseAlphabets,
    lowerCaseAlphabets,
  });
};

/**
 * Scrapes multiple URLs and combines their content
 * @param {string[]} urls - Array of URLs to scrape
 * @returns {Promise<{successfulScrapes: Array, failedUrls: Array, combinedText: string}>}
 */
const scrapeMultipleUrls = async (urls) => {
  const successfulScrapes = [];
  const failedUrls = [];
  
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      console.log(`🌐 Scraping URL ${i + 1}/${urls.length}:`, url);
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        },
      });
      
      const $ = cheerio.load(response.data);
      const scrapedText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 3000);
      
      if (scrapedText && scrapedText.length >= 50) {
        successfulScrapes.push({
          url: url,
          content: scrapedText,
          contentLength: scrapedText.length
        });
        console.log(`✅ URL ${i + 1} scraped successfully, content length:`, scrapedText.length);
      } else {
        failedUrls.push({ url: url, reason: "Scraped content too short or empty" });
        console.log(`⚠️ URL ${i + 1} content too short:`, scrapedText.length);
      }
      
    } catch (err) {
      console.error(`❌ Failed to scrape URL ${i + 1}:`, err.message);
      let errorReason = "Failed to scrape the link content";
      
      if (err.code === "ECONNABORTED") {
        errorReason = "Request timeout - the website took too long to respond.";
      } else if (err.code === "ENOTFOUND") {
        errorReason = "Website not found - please check if the URL is correct.";
      } else if (err.response?.status === 403) {
        errorReason = "Access denied - the website blocked our request.";
      } else if (err.response?.status === 404) {
        errorReason = "Page not found - the URL might be incorrect.";
      } else if (err.response?.status >= 500) {
        errorReason = "Server error - the website is experiencing technical difficulties.";
      } else {
        errorReason = `Failed to scrape the link content: ${err.message}`;
      }
      
      failedUrls.push({ url: url, reason: errorReason });
    }
  }
  
  // Combine all successful scrapes into one text
  let combinedText = "";
  successfulScrapes.forEach((data, index) => {
    combinedText += `\n\n--- SOURCE ${index + 1}: ${data.url} ---\n`;
    combinedText += `Content Length: ${data.contentLength} characters\n`;
    combinedText += `${data.content}\n`;
    combinedText += `--- END SOURCE ${index + 1} ---\n`;
  });
  
  return {
    successfulScrapes,
    failedUrls,
    combinedText
  };
};

module.exports = {
  signToken,
  hashPassword,
  comparePassword,
  decrypt,
  generateOtp,
  slugify,
  successHandler,
  scrapeMultipleUrls,
};
