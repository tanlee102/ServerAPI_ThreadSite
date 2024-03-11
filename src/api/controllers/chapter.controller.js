const M_Manga = require('../schema/mongodb/manga.schema');
const M_Chapter = require('../schema/mongodb/chapter.schema');

const generateString = require('../../helper/randomString');
const axios = require('axios');


class chapter {

    static update(req, res){

        console.log(req.body)

        let id_chapter = String(generateString(Number(process.env.HASH_ID_CHAPTER_LENGTH)));

        const m_chapter = new M_Chapter({
            ID: id_chapter,
            ID_Manga: req.body.manga_id,
            Number_chap: req.body.number_chap,
            Member_ID: req.body.user_id,
            title: req.body.title,
            content: req.body.content,
        });
        // Find and delete the existing document if it exists
        M_Chapter.findOneAndDelete({ Number_chap: req.body.number_chap, ID_Manga: req.body.manga_id })
        .then(() => {
            // Save the new document
            m_chapter.save()
                .then(() => {
                    console.log('Document inserted');
                    res.status(200).send({chapter_id: id_chapter});
                })
                .catch((error) => {
                    console.log(error)
                    res.status(400).send('Status: Bad Request');
                });
        })
        .catch((error) => {
            console.log(error)
            res.status(400).send('Status: Bad Request');
        });
    }


    static addView(req, res, next){
        M_Chapter.findOne({ ID: req.query.chapter_id }, {ID_Manga: 1})
        .exec(async (err, data) => {
          if (err) {
          } else {
            if (data) {
                await M_Manga.updateOne(
                    { ID: data.ID_Manga },
                    { $inc: { total_view: 1 } }
                );
            }
          }
        });
        return next();
    }


    static get(req, res){
        M_Chapter.findOne({ ID: req.query.chapter_id })
        .exec(async (err, data) => {
          if (err) {
            console.error(err);
            res.status(400).send('Status: Bad Request');
            // Handle the error
          } else {
            if (data) {
    
                // Find the document with the previous _id value
                const previousDoc = await M_Chapter.findOne({
                    Number_chap: { $lt: data.Number_chap },
                    ID_Manga: data.ID_Manga
                },{Number_chap: 1, ID: 1}).sort({ Number_chap: -1 }).limit(1);

                // Find the document with the next _id value
                const nextDoc = await M_Chapter.findOne({
                    Number_chap: { $gt: data.Number_chap },
                    ID_Manga: data.ID_Manga
                },{Number_chap: 1, ID: 1}).sort({ Number_chap: 1 }).limit(1);

                // Find the document with the next _id value
                const titleManga = await M_Manga.findOne({
                    ID: data.ID_Manga
                },{title: 1, url_image: 1, intro: 1, author: 1, ID: 1});
                
                res.status(200).send({data_chap: data, pre_chap: previousDoc, nex_chap: nextDoc, title_manga: titleManga});

            } else {
              console.log("Chapter not found");
              res.status(200).send({});
            }
          }
        });
    }


    // static get(req, res){
    //     M_Chapter.findOne({ ID: req.query.chapter_id })
    //     .exec(async (err, data) => {
    //       if (err) {
    //         console.error(err);
    //         res.status(400).send('Status: Bad Request');
    //         // Handle the error
    //       } else {
    //         if (data) {
    
    //             // Find the document with the previous _id value
    //             const previousDoc = await M_Chapter.findOne({
    //                 Number_chap: { $lt: data.Number_chap },
    //                 ID_Manga: data.ID_Manga
    //             },{Number_chap: 1, ID: 1}).sort({ Number_chap: -1 }).limit(1);

    //             // Find the document with the next _id value
    //             const nextDoc = await M_Chapter.findOne({
    //                 Number_chap: { $gt: data.Number_chap },
    //                 ID_Manga: data.ID_Manga
    //             },{Number_chap: 1, ID: 1}).sort({ Number_chap: 1 }).limit(1);

    //             // Find the document with the next _id value
    //             const titleManga = await M_Manga.findOne({
    //                 ID: data.ID_Manga
    //             },{title: 1, url_image: 1, intro: 1, author: 1, ID: 1, code: 1});

    //             var redata = data;
    //             axios.get(String(process.env.HOST_URL_MANGA)+'/api/urlchap?manga_code='+titleManga?.code+'&number_chap='+data?.Number_chap)
    //             .then(response => {
    //                 redata['content'] = response.data;
    //                 res.status(200).send({data_chap: redata, pre_chap: previousDoc, nex_chap: nextDoc, title_manga: titleManga});
    //             })
    //             .catch(error => {
    //                 console.error('Error:', error);
    //                 res.status(200).send({});
    //             });
                
    //         } else {
    //           console.log("Chapter not found");
    //           res.status(200).send({});
    //         }
    //       }
    //     });
    // }

}

module.exports = chapter;