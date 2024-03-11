const M_Manga = require('../schema/mongodb/manga.schema');
const M_Chapter = require('../schema/mongodb/chapter.schema');


const generateString = require('../../helper/randomString');


const getLatestChapter = (docs, next) => {

    const mangaIds = docs.map(doc => doc.ID); 
    // Find the latest chapter for each manga_id
    M_Chapter.aggregate([
        { $match: { ID_Manga: { $in: mangaIds } } },
        { $group: { _id: "$ID_Manga", latestChapter: { $max: "$Number_chap" } } }
    ]).exec((err, latestChapters) => {
        if (err) {
        console.error(err);
        // Handle the error
        } else {
            // Combine the retrieved documents, latest chapters, and manga list
            const combinedResult = docs.map(doc => {
                const matchingChapter = latestChapters.find(chapter =>
                doc.ID.includes(chapter._id)
                );
                return {
                ...doc.toObject(),
                latestChapter: matchingChapter ? matchingChapter.latestChapter : 0
                };
            });

            next(combinedResult)
     
        }
    });
}

class manga {

    static insert(req, res){

        let id_manga = String(generateString(Number(process.env.HASH_ID_MANGA_LENGTH)));

        const m_manga = new M_Manga({
            ID: id_manga,
            Member_ID: req.body.user_id,
            title: String(req.body.title).trim(),
            intro: String(req.body.intro).trim(),
            author: req.body.author,
            url_image: req.body.url_image,
        });
    
        m_manga.save().then(data => {
            res.status(200).send({manga_id: id_manga});
        })                            
        .catch(err => {
            console.log(err)
            res.status(400).send('Status: Bad Request');
        });

    }


    static getOne(req, res){
        M_Manga.findOne({ ID: req.query.manga_id })
        .exec((err, manga) => {
          if (err) {
            console.error(err);
            res.status(400).send('Status: Bad Request');
            // Handle the error
          } else {
            if (manga) {

                M_Chapter.find({ ID_Manga: req.query.manga_id }).sort({ Number_chap: -1 }).select({ Number_chap: 1, title: 1, ID: 1, _id: 0 })
                .exec((err, chapters) => {
                    if (err) {
                      console.error(err);
                      res.status(400).send('Status: Bad Request');
                    } else {
                        res.status(200).send({info: manga, list_chap: chapters});
                    }
                  });

              // Use the manga information
            } else {
              console.log("Manga not found");
              res.status(200).send({});
            }
          }
        });
    }


    static getHomeTop(req, res){
        // Find documents and sort by total_view in descending order
        M_Manga.find({})
        .sort({ total_view: -1 })
        .limit(4)
        .exec((err, docs) => {
            if (err) {
                console.error(err);
                res.status(400).send('Status: Bad Request');
            } else {

                getLatestChapter(docs, (combinedResult) => {
                    res.status(200).send(combinedResult);
                })

            }
        });
    }


    static getMangasSortedByView(req, res) {
        const page = parseInt(req.query.page) || 1;
        const perPage = 12;
      
        const skip = (page - 1) * perPage;
      
        M_Manga.find({})
          .sort({ total_view: -1 })
          .skip(skip)
          .limit(perPage)
          .exec((err, docs) => {
            if (err) {
                console.error(err);
                res.status(400).send('Status: Bad Request');
            } else {
                getLatestChapter(docs, (combinedResult) => {
                    res.status(200).send(combinedResult);
                })
            }
        });
    }


    static getMangasSortedByLatestChapter(req, res) {
        const page = parseInt(req.query.page) || 1; // Get the page number from the request query parameters (default: 1)
        const limit = 12; // Set the limit of mangas per page
    
        M_Manga.aggregate([
            {
                $lookup: {
                    from: "chapters", // Name of the chapters collection
                    localField: "ID", // Field in the Mangas collection
                    foreignField: "ID_Manga", // Field in the Chapters collection
                    as: "latestChapter"
                }
            },
            {
                $unwind: {
                    path: "$latestChapter",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: {
                    "latestChapter._id": -1
                }
            },
            {
                $group: {
                    _id: "$_id",
                    manga: { $first: "$$ROOT" },
                    latestChapter: { $first: "$latestChapter" }
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$manga", { latestChapter: "$latestChapter" }]
                    }
                }
            },
            {
                $sort: {
                    "latestChapter._id": -1
                }
            },
            {
                $skip: (page - 1) * limit // Calculate the number of documents to skip based on the page number and limit
            },
            {
                $limit: limit // Limit the number of documents per page
            },
            {
                $project: {
                    ID: "$ID",
                    title: "$title",
                    url_image: "$url_image",
                    author: "$author",
                    total_view: "$total_view",
                    latestChapter: "$latestChapter.Number_chap"
                }
            }
        ])
        .exec((err, mangas) => {
            if (err) {
                console.error(err);
                res.status(400).send('Status: Bad Request');
            } else {
                res.status(200).send(mangas);
            }
        });
    }



}

module.exports = manga;