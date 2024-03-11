const {check} = require('express-validator');

const UserServer = require('../signals/user.server');

const categoryController = require('../controllers/category.controller');
const subforumController = require('../controllers/subforum.controller');
const tagthreadController = require('../controllers/tagthread.controller');
const threadController = require('../controllers/thread.controller');
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const memberController = require('../controllers/member.controller');
const notificationController = require('../controllers/notification.controller');
const privacyController = require('../controllers/privacy.controller');
const wordController = require('../controllers/word.controller');
const pollController = require('../controllers/poll.controller');
const mangaController = require('../controllers/manga.controller');
const chapterController = require('../controllers/chapter.controller');

const MysqlQuery = require('../query/mysql.query');
const M_Word = require('../schema/mongodb/word.schema');

const express=require("express");
const router=express.Router();
const router1=express.Router();
const router2=express.Router();
const router3=express.Router();
const router4=express.Router();
const router5=express.Router();
const router6=express.Router();
const router8=express.Router();
const router9=express.Router();
const router10=express.Router();
const router11=express.Router();
const router12=express.Router();
const router13=express.Router();

const UserMiddleWare = require('../middleware/user.middleware');
const {trackIdMember} = require('../middleware/track.middleware');
const {checkPrivacy} = require('../middleware/privacy.middleware');
const {usecache} = require('../middleware/cache.middleware');
const {untouchableAdmin} = require('../middleware/hierarchy.middleware')

const checkAuthUserDefault = UserMiddleWare.checkAuthUserDefault;
const checkAuthUser = UserMiddleWare.checkAuthUser;
const checkAuthAdmin = UserMiddleWare.checkAuthAdmin;
const checkParameters = UserMiddleWare.checkParameters;



console.log("first-time");

let BanList = [];

function removeItem(arr, item){
    return arr.filter(f => f !== item);
}

const loadListBanned = async () => {
    let myPromise = new Promise(function(resolve) {
        MysqlQuery.select("SELECT Member_ID FROM Banned", function(error_code, result){
            if(error_code == 0){
                resolve("fail");
            }else{
                resolve(result);
            }
        })
    });
    let data = await myPromise;    
    let ReList = [];
    data.forEach(element => {
        ReList.push(element.Member_ID);
    });
    return ReList;
}

const loadListWordsBlock = async () => {
    let myPromise = new Promise(function(resolve) {
        M_Word.findOne({label: 'word-block'}).exec(function (err, data) {
            if (err) console.log(err);
            else{
                resolve(data.words);
            }
        });
      });
      return await myPromise;
}


module.exports = async function(routerx){

    BanList = await loadListBanned();
    WordsBlockList = await loadListWordsBlock();

    UserMiddleWare.banList = BanList;
    

    routerx.use("/subforum/", router);
    router
    .get('/top',[
    ],checkAuthUserDefault, subforumController.getTopByCategory) // set cache.

    .get('/get', [
        check('category_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('subforum_id').isNumeric().isInt({ min: -10, max: 1000000 }),
        check('page').isNumeric().isInt({ min: -10, max: 1000000 }),
        check('sorting_setting').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SORTTING_LENGTH) }),
    ], checkAuthUserDefault ,subforumController.getByCategory)

    .get('/list/search', [
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('search').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SEARCH_LENGTH) }),
    ], checkAuthUser ,subforumController.getListSearchSubForum)

    .get('/member/get', [
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('subforum_id').isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkAuthUserDefault, subforumController.getByMember)

    .get('/info/addpost', [
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser, usecache(1800), subforumController.loadInfoAddPost) //use cache

    .post('/insert',[
        check('category_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('title').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_SUBFORUM_NAME_LENGTH), max: Number(process.env.MAX_SUBFORUM_NAME_LENGTH) }),
        check('introduce').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_SUBFORUM_INTRODUCE_LENGTH) }),
    ], checkAuthUser,subforumController.insert)

    .post('/update',[
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('title').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_SUBFORUM_NAME_LENGTH), max: Number(process.env.MAX_SUBFORUM_NAME_LENGTH) }),
        check('introduce').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_SUBFORUM_INTRODUCE_LENGTH) }),
    ], checkAuthUser,subforumController.update)

    .post('/delete',[
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser,subforumController.delete)

    .post('/save', [
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('is_save').not().isEmpty().bail().isBoolean(),
    ], checkAuthUser,subforumController.save)





    

    routerx.use("/category/", router1);
    router1
    .get('/', usecache(1800),categoryController.getall) //use cache
    .post('/insert', checkAuthAdmin,categoryController.insert)






    routerx.use("/colorlist/", router2);
    router2
    .get('/', usecache(1800),tagthreadController.getListColorPanel); //use cache






    routerx.use("/tagthread/", router3);
    router3
    .get('/', usecache(1800),tagthreadController.getall) //use cache
    .post('/insert', checkAuthAdmin, tagthreadController.insert)








    routerx.use("/thread/", router4);
    router4
    .get('/head/', [
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUserDefault, threadController.getHead)

    .get('/others/', [
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('thread_id').isNumeric().isInt({ min: -10, max: 1000000 }),
        check('page').isNumeric().isInt({ min: -10, max: 1000000 }),
        check('sorting_setting').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SORTTING_LENGTH) }),
    ], checkParameters, usecache(9), threadController.getOther) //use cache

    .get('/latest/', usecache(60),threadController.getLatest) //use cache

    .get('/suggest/',[
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('thread_id').isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkParameters,threadController.getSuggest) //use cache

    .get('/latest/super', usecache(60),threadController.getLatestSuper) //use cache

    .get('/list/latest',[
        check('cur_thread_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkAuthUserDefault, usecache(10), threadController.getListLatest) //use cache

    .get('/list/top',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkAuthUserDefault, usecache(10), threadController.getListTop) //use cache

    .get('/list/search',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('search').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SEARCH_LENGTH) }),
    ],checkAuthUserDefault, threadController.getListSearch)

    .post('/create', function (req, res, next) {
        if (WordsBlockList.some(v => String(req.body.content).includes(v))) {
            res.status(400).send('Status: Bad Request');
        }else{
            return next();
        }
    },[
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('tagthread_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('title').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_POST_TITLE_LENGTH), max: Number(process.env.MAX_POST_TITLE_LENGTH) }),
        check('image').isString().isLength({ min: 1, max: 350 }),
        check('content').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_POST_LENGTH), max: Number(process.env.MAX_POST_LENGTH) }),
    ], checkAuthUser,threadController.insert)

    .post('/pin',[
        check('thread_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('subforum_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('priority').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkAuthUser, threadController.pinThread)

    .post('/delete',[
        check('thread_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser,threadController.deleteThread);










    
    routerx.use("/post/", router5);
    router5
    .get('/newfeed',[
    ], checkAuthUser ,postController.getNewFeed)

    .get('/',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('thread_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], (req, res, next) => {
        //THIS IS A BUG I NEED TO SOLVE.
        if(req.query.page === 'NaN') req.query.page = 1;
        return next();
    },checkParameters, usecache(25), postController.getData) //use cache

    .get('/get/like',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('thread_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkAuthUserDefault, postController.getLikeData)

    .get('/index',[
        check('post_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkParameters, usecache(60) ,postController.getIndexPost) //use cache

    .get('/manage/list', [
        check('cur_post_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthAdmin, postController.getListManagePost)

    .post('/create', function (req, res, next) {
        if (WordsBlockList.some(v => String(req.body.content).includes(v))) {
            res.status(400).send('Status: Bad Request');
        }else{
            return next();
        }
    },[
        check('thread_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('reply_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('content').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_POST_LENGTH), max: Number(process.env.MAX_POST_LENGTH) }),
        check('name_user_reply').isString().isLength({ min: Number(process.env.MIN_NAME_MEMBER_LENGTH), max: Number(process.env.MAX_NAME_MEMBER_LENGTH) }),
    ], checkAuthUser ,postController.insert)

    .post('/delete', [
        check('post_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('thread_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser, postController.deleteOne)

    .post('/like',[
        check('post_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser, postController.setLike)
    










    ///Msg API:
    routerx.use("/msg/", router6);
    router6
    .post('/create',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('text').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_MSG_LENGTH), max: Number(process.env.MAX_MSG_LENGTH) }),
    ], checkAuthUser, checkPrivacy ,commentController.insertMsg)

    .post('/re/create',[
        check('id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('text').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_MSG_LENGTH), max: Number(process.env.MAX_MSG_LENGTH) }),
    ], checkAuthUser, checkPrivacy ,commentController.insertReMsg)

    .get('/get',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('curLoadID').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkParameters, commentController.getMsgs)

    .get('/re/get',[
        check('id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('curLoadID').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkParameters,commentController.loadReMsgs)

    .post('/re/delete',[
        check('id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('id_').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser, commentController.deleteReMsg)

    .post('/delete',[
        check('id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser, commentController.deleteMsg)










    ///MEMBER API:
    routerx.use("/member/", router8);
    router8

    .get('/list',[
        check('sorting_setting').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SORTTING_LENGTH) }),
    ], checkParameters, memberController.getListMember)

    .get('/list/search',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('search').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SEARCH_LENGTH) }),
    ],checkAuthUserDefault, memberController.getListSearchMember)

    .get('/manage/list/',[
        check('sorting_setting').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SORTTING_LENGTH) }),
    ], checkAuthAdmin, memberController.getListManageMember)


    .get('/headinfo', [
        check('user_name').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_NAME_USER_LENGTH), max: Number(process.env.MAX_NAME_USER_LENGTH) }),
    ] ,checkAuthUserDefault, trackIdMember, memberController.getHeadInfoMember)

    .post('/follow',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('isfollowed').not().isEmpty().bail().isBoolean(),
    ], checkAuthUser ,memberController.setFollow)

    .get('/follower', [
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUserDefault, memberController.getUserFollower)

    .get('/followed', [
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUserDefault, checkPrivacy, memberController.getUserFollowed)

    .get('/posts/timeline',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkParameters, memberController.getMemberPostTimeLine)

    .get('/posts/liked',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUserDefault, checkPrivacy, memberController.getMemberPostLiked)


    .post('/manage/ban/add', [
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthAdmin, untouchableAdmin, memberController.addListBanned ,function name(req, res) {
        BanList.push(Number(req.body.member_id))
        UserMiddleWare.banList = BanList;
        console.log(BanList)
        res.status(201).send("Created");

        UserServer.BanUpdate();
    })
    .post('/manage/ban/remove',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthAdmin, memberController.removeListBanned ,function name(req, res) {
        BanList = removeItem(BanList, Number(req.body.member_id));
        UserMiddleWare.banList = BanList;
        console.log(BanList)
        res.status(201).send("Created");

        UserServer.BanUpdate();
    })


    .post('/block/add', [
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser, untouchableAdmin, memberController.addListBlocked)

    .post('/block/remove',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkAuthUser, memberController.removeListBlocked)    

    .get('/block/list',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkAuthUser, memberController.getUserBlocked)    


    .post('/activity/delete',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('time').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ],checkAuthAdmin, untouchableAdmin, memberController.deleteActivity)    


    .get('/privacy/get',[
    ], checkAuthUser, privacyController.get)

    .post('/privacy/update',[
        check('send_message').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('post_liked').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
        check('member_following').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser, privacyController.update)









    //NOTIFICATION API
    routerx.use("/notification/", router9);
    router9
    .get('/',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkAuthUser, notificationController.getNotification)

    .get('/count',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkParameters, notificationController.countNotification)

    .post('/count',[
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkParameters, notificationController.countNotification);






    //WORD API
    routerx.use("/word/", router10);
    router10
    .post('/block/update',[
    ], checkAuthAdmin, wordController.updateByWordBlock,function (req, res) {
        WordsBlockList = req.body.words;
        res.status(201).send("Created");
    })

    .get('/block/get',[
    ], checkAuthAdmin, wordController.getByWordBlock);





    
    //POLL API
    routerx.use("/poll/", router11);
    router11
    .post('/add',[

        check('title').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_POLL_TITLE_LENGTH) }),
        check('items').isArray({ min: 2, max: Number(process.env.MAX_POLL_ITEM_LENGTH)}),
        check('items.*.label').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(400) }),
        check('items.*.url').isString().isLength({ min: 0, max: Number(400) }),
        check('tags').isArray({ min: 0, max: 10 }),
        check('tags.*').isString().isLength({ min: 1, max: 70 }),

    ], checkAuthUser, pollController.insert)

    .post('/delete',[
        check('poll_id').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_HASH_ID_POLL_LENGTH) }),
    ], checkAuthUser , pollController.delete)

    .get('/get',[
        check('id').not().isEmpty().bail().isString().isLength({ min: 5, max: Number(process.env.MAX_HASH_ID_POLL_LENGTH)  }),
        // check('low_list').isArray({ min: 0, max: Number(process.env.MAX_LOW_LIST_POLL)  }),
        // check('low_list.*').isString().isLength({ min: 1, max:  Number(process.env.MAX_HASH_ID_POLL_LENGTH)  }),
    ], checkParameters, pollController.get)

    .post('/upvote',[
        check('poll_id').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_HASH_ID_POLL_LENGTH) }),
        check('id').not().isEmpty().bail().isNumeric().isInt({ min: 1, max:  Number(process.env.MAX_POLL_ITEM_LENGTH) }),
        check('de_id').not().isEmpty().bail().isNumeric().isInt({ min: -1, max:  Number(process.env.MAX_POLL_ITEM_LENGTH) }),
    ], checkParameters , pollController.upVote)

    .get('/list/top',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000 }),
    ], checkParameters , pollController.getTopList)

    .get('/list/latest',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000 }),
    ], checkParameters, pollController.getLatestList)

    .get('/member/latest',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000 }),
        check('member_id').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    ], checkParameters, pollController.getMemberLatestList)

    .get('/list/search',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000 }),
        check('search').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SEARCH_LENGTH) }),
    ], checkAuthUserDefault, pollController.getListBySearch)



    //MANGA API
    routerx.use("/manga/", router12);
    router12
    .post('/insert',[
        check('title').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_POLL_TITLE_LENGTH) }),
        check('intro').not().isEmpty().bail().isString().isLength({ min: 1, max: 10000 }),
        check('url_image').not().isEmpty().bail().isString().isLength({ min: 1, max: 1000 }),
        check('author').not().isEmpty().bail().isString().isLength({ min: 1, max: 200 }),
    ], checkAuthAdmin, mangaController.insert)

    .get('/get/home/top',[
    ], usecache(180), mangaController.getHomeTop)

    .get('/get/list/latest',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000 }),
    ], checkParameters, usecache(60), mangaController.getMangasSortedByLatestChapter)

    .get('/get/list/top',[
        check('page').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000 }),
    ], checkParameters, usecache(60), mangaController.getMangasSortedByView)

    .get('/get/one',[
        check('manga_id').not().isEmpty().bail().isString().isLength({ min: 1, max: 100 }),
    ], checkParameters, usecache(60), mangaController.getOne)


    //CHAPTER API
    routerx.use("/chapter/", router12);
    router12
    .post('/update',[
        check('title').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_POLL_TITLE_LENGTH) }),
        check('content').not().isEmpty().bail(),
        check('number_chap').not().isEmpty(),
        check('manga_id').not().isEmpty().bail().isString().isLength({ min: 1, max: 100 }),
    ], checkAuthAdmin, chapterController.update)

    .get('/get/',[
        check('chapter_id').not().isEmpty().bail().isString().isLength({ min: 1, max: 100 }),
    ], checkParameters, chapterController.addView, usecache(100), chapterController.get)


}











// const router7=express.Router();
// const userController = require('../controllers/user.controller');

    // ///PERSONAL API:
    // routerx.use("/user/", router7);
    // router7

    // //Detail Account.
    // .get('/detail',[], checkAuthUser, userController.getDetailUser)
    
    // .post('/detail/update',[
    //     check('name').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_NAME_MEMBER_LENGTH), max: Number(process.env.MAX_NAME_MEMBER_LENGTH) }),
    //     check('quote').isString().isLength({ max: Number(process.env.MAX_DEFAULT_USER_LENGTH) }),
    //     check('address').isString().isLength({ max: Number(process.env.MAX_DEFAULT_USER_LENGTH) }),
    //     check('contact').isString().isLength({ max: Number(process.env.MAX_DEFAULT_USER_LENGTH) }),
    //     check('birthday').isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SETTING_LENGTH) }),
    // ], checkAuthUser, userController.updateDetailUser)

    // //Get List Device Logged.
    // .get('/list/logged', [
    //     check('refresh_token').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_TOKEN_LENGTH) }),
    // ],checkAuthUser , userController.getAllLogged)

    // .post('/delete/logged', [
    //     check('device').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SETTING_LENGTH) }),
    //     check('time').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_DEFAULT_SETTING_LENGTH) }),
    // ], checkAuthUser ,userController.removeLogged)

    // //Refresh Token
    // .post('/token',[
    //     check('refresh_token').not().isEmpty().bail().isString().isLength({ min: 1, max: Number(process.env.MAX_TOKEN_LENGTH) }),
    // ], checkParameters, userController.getToken)


    
    // .post('/username/check',[
    //     check('user_name').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_NAME_USER_LENGTH), max: Number(process.env.MAX_NAME_USER_LENGTH) }),
    // ], checkAuthUser, userController.checkUserName)

    // .post('/username/update',[
    //     check('user_name').not().isEmpty().bail().isString().isLength({ min: Number(process.env.MIN_NAME_USER_LENGTH), max: Number(process.env.MAX_NAME_USER_LENGTH) }),
    // ], checkAuthUser, userController.updateUserName)
    
    // // .get('/trackuser',userController.trackUser)

    // .post('/check/validator',[
    //     check('data').not().isEmpty().bail().isNumeric().isInt({ min: -10, max: 1000000 }),
    // ], checkTry)



    