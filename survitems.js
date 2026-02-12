import axios from "axios";
import { load } from "cheerio";

async function scrapeDBDItems() {
  const url = "https://deadbydaylight.wiki.gg/wiki/Items";

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    });

    const $ = load(data);
    const items = [];

    $("table.wikitable").each((_, table) => {
      $(table)
        .find("tr")
        .each((_, row) => {
          const cells = $(row).find("td");

          if (cells.length >= 3) {
            const nameCell = $(cells[1]);
            const imageCell = $(cells[0]);
            const descCell = $(cells[2]);

            const name = nameCell.find("a").last().text().trim();

            let image = imageCell.find("img").attr("src") || imageCell.find("img").attr("data-src");

            if (image) {
              if (image.startsWith("/")) {
                image = "https://deadbydaylight.wiki.gg" + image;
              }
              image = image.replace(/\/thumb\//g, "/").split("/80px-")[0];
              image = image.split("?")[0];
            }

            let description = descCell
              .text()
              .replace(/\[\d+\]/g, "")
              .replace(/\n+/g, " ")
              .trim();

            if (name && description && name !== "Name") {
              items.push({
                name: name,
                image: image,
                description: description,
              });
            }
          }
        });
    });

    console.log(JSON.stringify({ items }, null, 2));
  } catch (error) {
    console.error("Error scraping:", error.message);
  }
}

scrapeDBDItems();
