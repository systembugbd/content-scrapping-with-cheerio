const express = require("express");
const cherrio = require("cheerio");
const router = express.Router();

const axios = require("axios");
const duaandzikir = [];
let duaInfo = [];

const getContent = (req, res, next) => {
  const lang = req.query.lang || "bn";
  // console.log(lang);

  axios
    .get(`https://dua.gtaf.org/${lang}`)
    .then((response) => {
      const html = response.data;
      const $ = cherrio.load(html);
      //   console.log($("#homeCats", html).children());
      $("#homeCats a", html).each((i, e) => {
        const href = $(e).attr("href");
        const category = $(e).children("#daily").children("h3").text();
        console.log(href);

        axios
          .get(href)
          .then((resOfCatPage) => {
            let categoryTotal = [];
            const duaHtml = resOfCatPage.data;
            const $ = cherrio.load(duaHtml);
            $("#navbar")
              .children("li")
              .children("a")
              .each((i, e) => {
                const link = $(e).attr("href");
                const id = $(e).text().trim().replace(/\n/, "").split(" ")[0];
                const title = $(e)
                  .text()
                  .replace(/" "/, "")
                  .replace('" ', "")
                  .split("\n")[2]
                  .trim();
                // console.log(link);
                let length = Object.keys(duaInfo).length;

                duaInfo.push({
                  serial: length,
                  category,
                  id,
                  title,
                  link,
                });
              }); // each
            /** Phanthom for Dynaic DATA END */

            //Paginated API configuration
            if (
              Object.keys(req.query).length > 0 &&
              req.query.page &&
              req.query.limit
            ) {
              let page = parseInt(req.query.page);
              let limit = parseInt(req.query.limit);
              let startInde = (page - 1) * limit;
              let endIndex = page * limit;
              let prevPage = page - 1;
              let nextPage = page + 1;
              // console.log(startInde, endIndex, page, limit,);
              let paginatedDua = {};
              (paginatedDua.previous = {
                page: prevPage <= 0 ? prevPage + 1 : prevPage,
                limit: limit,
                totalDua: duaInfo.length,
              }),
                (paginatedDua.next = {
                  page: nextPage,
                  limit: limit,
                  totalDua: duaInfo.length,
                });

              // let length = Object.keys(duaInfo).length;
              // categoryTotal.push({
              //   category,
              //   totalDua: length,
              // });
              // paginatedDua.category = categoryTotal;

              paginatedDua.dua = duaInfo.splice(startInde, endIndex);
              res.dua = paginatedDua;
              next();
            } // paginated end

            // let lengths = Object.keys(duaInfo).length;
            // categoryTotal.push({
            //   category,
            //   totalDua: lengths,
            // });

            // duaInfo.push({
            //   categoryTotal,
            // });
            res.dua = duaInfo;
            next();
          })
          .catch((e) => {
            res.status(500).json({ msg: e });
          });
      });
    })
    .catch((e) => {
      res.status(500).json({ msg: e });
    });
};

router.get("/dua", getContent, (req, res, next) => {
  res.status(200).json({ duaandzikir: res.dua });
});

module.exports = router;
