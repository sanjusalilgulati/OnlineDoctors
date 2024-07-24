const express = require("express");
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Jwt = require('jsonwebtoken');
const UserLoginDetails = require("../models/UserLoginDetails");
const { saveUserDeviceDetail, sendPushNotification } = require("../config/sendPushNotification");
const {sendSMS} = require("../config/twilioAPI");
const multer = require('multer');
const path = require('path');
const Country = require("../models/country");
const calls = require("../models/calls");
const UserDeviceDetails = require("../models/UserDeviceDetails");
const AvailableSlots = require("../models/AvailableSlots");
const userStatusLog = require("../models/userStatusLog");
const { getListing, uploadFile } = require("../config/aws");
const { addCustomer } = require("../config/stripe");
const { getSubscription } = require("../config/common");
const questions = require('../config/questions');
const chatboat = require("../models/chatboat");
const chatboatItems = require("../models/chatboatItems");
const JwtKey = process.env.PROJECT_NAME;

const storage = multer.diskStorage({
    destination : './upload/images',
    filename : (req, file, cb ) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: (req, file, cb) => {
        // Allowed ext
        const filetypes = /jpeg|jpg|png/;
        // Check ext
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
         // Check mime
        if(extname){
            return cb(null, true);
        } else {
            return cb("Error", false);
        }
    }
})

router.get('/test-lang', (req,res) => {
    res.send({message : res.__('MESSAGE')});
})

router.post('/register', async (req, res) => {
    const UploadProfileFile = upload.single('profile');
    UploadProfileFile(req, res, async function (err) {
        if(err)
        {
           return res.status(400).json({error : res.__("IMAGE_FORMAT")});
        }

        const { firstName, lastName, email, password, userType, country, city, dob, gender, referral_code } = req.body;
        var phone = req.body.phone;
        var baseUrl = req.protocol + '://' + req.get('host') + '/';
        if(!email || !password || !firstName || !lastName || !phone || !userType || !country)
        {
            return res.status(400).json({error : res.__("FILLED_ALL_PROPERTY")});
        }
        let profile   = '';
        if(typeof(req.file) != "undefined")
        {
             profile   = `/upload/images/${req.file.filename}`;
        }
        let country_dial_code = "";
        let country_name = country;
        if(country)
        {
            let splitCountry = country.split('-');
            if(splitCountry[0])
            {
                country_dial_code = splitCountry[0];
                country_name = splitCountry[1];
            }
            phone = phone;
        }
        try{
            const userExist = await User.findOne({email, email});
            if(userExist)
            {
                return res.status(400).json({error : res.__("EMAIL_ALREADY_EXIST")});
            }
            const randNumber = Math.floor(100000 + Math.random() * 900000);
        
            const smsData = {
                body : 'Your OnlineDoctors ID code is: '+randNumber+'. Do not share it with anyone.',
                to : country_dial_code+''+phone
            }
            let otp = randNumber;
            let is_verified = false;
            const userModel = new User({firstName, lastName, email, password, phone, userType, country_name, country_dial_code,  city, dob, gender, referral_code, profile, otp, is_verified});
    
            const resp = await userModel.save();
            if (resp.profile) {
                var splitProfile = resp.profile.split("/");
                resp.profile = `${baseUrl}${splitProfile[3]}`;
            }
            const resData = {
                _id       : resp._id,
                firstName : resp.firstName,
                lastName  : resp.lastName,
                email     : resp.email,
                phone     : resp.phone,
                is_verified : resp.is_verified
            }
            sendSMS(smsData).then((message) =>{
                res.status(200).json({message : res.__("REGISTERD_SUCESSFULL"), data : resData});
            }, async (error) => {
                await User.deleteOne({_id : resp._id});
                res.status(400).json({message : res.__('VERIFY_NUMBER')});
            });
        }catch(err)
        {
            if(err.keyValue)
            {
                var keys = res.__('ERROR_WENT_WRONG')+Object.keys(err.keyValue)[0];
                return res.status(400).json({error : keys});
            }else{
                return res.status(400).json({error : err});
            }
        }
    });    
   
})

router.put('/verify-otp/:id', async (req,res)=> {
    var baseUrl = req.protocol + '://' + req.get('host') + '/';
    const { otp, userRole, login_device_type, login_device_name, fcm_device_token} = req.body;
    if(!otp || !userRole || !login_device_type || !login_device_name || !fcm_device_token)
    {
        return res.status(400).json({error : res.__('FILLED_ALL_PROPERTY')});
    }
    const data = await User.findOne({_id : req.params.id});
    if(data)
    {
        var timeStart = new Date(data.updatedAt);
        var timeEnd = new Date();
        var minsdiff = Math.abs(timeEnd - timeStart); 
        minsdiff = Math.trunc(minsdiff/60/1000);
        if(process.env.OTP_VERIFY_TIME >= minsdiff)
        {
            if(data.otp == otp)
            {
                const customerData = {
                    name  : `${data.firstName} ${data.lastName}`,
                    email : data.email,
                    phone : data.phone
                }
                const customer = await addCustomer(customerData);
                if(customer.id)
                {
                const updateVerification = await User.findOneAndUpdate({
                    _id : req.params.id
                },
                { 
                    $set : {
                        is_verified : true,
                        stripe_customerId : customer.id
                    }
                }, {
                    new : true
                });
                var profile = '';
                if(data.profile)
                {
                    var splitProfile = updateVerification.profile.split("/");
                    profile = `${baseUrl}${splitProfile[3]}`;
                }
                const resp = {
                    'firstName' :  data.firstName,
                    'lastName' : data.lastName,
                    'email' : data.email,
                    'dob' : data.dob,
                    'profile' : profile,
                    'is_verified' : data.is_verified
                }
                Jwt.sign({data}, JwtKey, {expiresIn:"12h"}, async (err, token) => {
                    if(err)
                    {
                        return res.status(400).json({error : res.__('ERROR_WENT_WRONG')});
                    }
                    const tokenData = {
                        _token : token,
                        userId : data._id,
                        login_device_type : !req.body.login_device_type ? 1 : req.body.login_device_type,
                        login_device_name : !req.body.login_device_name ? "Redmi Note 1" : req.body.login_device_name,
                        is_login : 1
                    };
                    const tokenModel =  new UserLoginDetails(tokenData);
                    const dataToken = await tokenModel.save();
                    if(dataToken){
                        if(req.body.login_device_type != 3)
                        {
                            const deviceData = {
                                fcm_device_token : req.body.fcm_device_token,
                                userId : data._id,
                                login_device_type : !req.body.login_device_type ? 1 : req.body.login_device_type,
                                login_device_name : !req.body.login_device_name ? "Redmi Note 1" : req.body.login_device_name,
                            };
                            saveUserDeviceDetail(deviceData);
                        }
                        res.status(200).json({ message: res.__('VERIFIED_AND_LOGIN'), user_role: data.userType.toLowerCase(),userId : data._id, auth : token, data :resp });
                    }else{
                        res.status(400).json({ message: res.__('ERROR_WENT_WRONG') });
                    }
                })
            }else{
                res.status(400).json({ message: res.__('ERROR_WENT_WRONG') });
            }
            }else{
                res.status(400).json({error : res.__('INVALID_OTP')});
            }
        }else{
            res.status(400).json({error : res.__('OTP_EXPIRED')})
        }
    }else{
        res.status(400).json({error : res.__('NO_USER_FOUND')});
    }
})

router.post('/login', async (req, res) => {
    const data = await User.findOne({
        $or : [
            { email : req.body.email}, 
            { phone : req.body.email}
        ]
    });
    var baseUrl = req.protocol + '://' + req.get('host') + '/';
    if(data && req.body.userRole)
    {
        /**
         * Her We check userRole 
         * 2 for Patient & 3 For Doctor
         * 1 for Web.
         */
        if(data.userType == req.body.userRole)
        {
            var profile = '';
            if(data.profile)
            {
                var splitProfile = data.profile.split("/");
                profile = `${baseUrl}${splitProfile[3]}`;
            }
            const resp = {
                '_id'   : data._id,
                'firstName' :  data.firstName,
                'lastName' : data.lastName,
                'email' : data.email,
                'dob' : data.dob,
                'is_verified' : data.is_verified,
                'profile' : profile,
                'phone'   : data.phone
            }
            if(data.is_verified){
                const pass = await bcrypt.compare(req.body.password, data.password);
                if(pass)
                {   
                    
                    Jwt.sign({data}, JwtKey, {expiresIn:"120h"}, async (err, token) => {
                        if(err)
                        {
                            return res.status(400).json({error : res.__('ERROR_WENT_WRONG')});
                        }
                        const tokenData = {
                            _token : token,
                            userId : data._id,
                            login_device_type : !req.body.login_device_type ? 1 : req.body.login_device_type,
                            login_device_name : !req.body.login_device_name ? "Redmi Note 1" : req.body.login_device_name,
                            is_login : 1
                        };
                        const tokenModel =  new UserLoginDetails(tokenData);
                        const dataToken = await tokenModel.save();
                        if(dataToken){
                            if(req.body.login_device_type != 3)
                            {
                                const deviceData = {
                                    fcm_device_token : req.body.fcm_device_token,
                                    userId : data._id,
                                    login_device_type : !req.body.login_device_type ? 1 : req.body.login_device_type,
                                    login_device_name : !req.body.login_device_name ? "Redmi Note 1" : req.body.login_device_name,
                                };
                                saveUserDeviceDetail(deviceData);
                            }
                            const userSubscription = await getSubscription(data._id);
                            res.status(200).json({ message: res.__('LOGIN'), user_role: data.userType.toLowerCase(),userId : data._id, auth : token, activeSubscription : userSubscription,  data :resp });
                        }else{
                            res.status(400).json({ error: res.__('ERROR_WENT_WRONG') });
                        }
                    })
                }else{
                    res.status(400).send({message : res.__('PASSWORD_MISMATCH')});
                }
            }else{
                res.status(401).send({message : res.__('ACCOUNT_VERIFY'), resp});
            }
        }else{
            res.status(400).send({message : res.__('UNAUTHORIZE_ROLE')});
        }
    }else{
        res.status(400).send({message : res.__('EMAIL_NOT_EXIST')});
    }
});

/**
 * When user is logout then mark the status is_login 2 
 * Means user is logout also updatedAt changed
 * CreatedAt is login time and updateAt is logout time
 * */

router.get("/logout/:id", async (req, res) => {
    const data = await UserLoginDetails.updateMany(
       {
         userId : req.params.id,
         is_login : 1
       },
       {
         $set : {
            is_login : 2
         }
       }
    ).sort( { "createdAt": -1 } );
    res.status(200).json({message : res.__('LOGOUT')});
});
/**
 *  Get Country list using IN query with country code
 *  */ 
router.get("/country-list", async (req, res) => {
    const data = await Country.find({ code : {$in : ['IN', 'CA', 'AE', 'SA', 'TJ','RU','KZ','US']}});
    if(data)
    {
        res.status(200).json({data});
    }else{
        res.status(400).json({message : res.__('ERROR_WENT_WRONG')})
    }
});

router.post("/resend-otp/:id", async (req,res) => {
    const {phone} = req.body;
    const randNumber = Math.floor(100000 + Math.random() * 900000);
    
   
    const data = await User.findOneAndUpdate({
        _id : req.params.id
    },{
        $set : {otp : randNumber}
    }, {new : true});
    const smsData = {
        body : 'Hi, your OnlineDoctors verification code is: '+randNumber+'. Do not share it with anyone.',
        to : data.country_dial_code+''+phone
    }
    if(data._id)
    {
        sendSMS(smsData);
        const respData = {
            _id : data._id,
            phone : data.phone,
            email : data.email
        }
        res.status(200).json({message : res.__('OTP_SEND'), respData});
    }else{
        res.status(400).json({error : res.__('ERROR_WENT_WRONG')});
    }
})

router.post("/send-notification", async (req, res) => {
    const {userId, payLoad, title, body} = req.body;
    const NotifyData = payLoad;
    const bodyData = {
        title : title,
        body : body,
        icon: 'myicon', //Default Icon
        sound: 'mysound', //Default sound
    }
    const type = 2;
    const sendNotification = await sendPushNotification(userId, bodyData, NotifyData, type, bodyData);
    res.status(200).json({"message" : res.__('NOTIFICATION_PUSH')});
})


router.post('/send-otp', async (req,res) => {
    const {phone} = req.body;
    if(email)
    {
        const data = await User.findOneAndUpdate(
            {
                phone : email
            },
            {
                $set : 
                {
                    otp : "123456"
                }
            },
            {
                fields :  {
                    phone : 1,
                    otp : 1
                },
                new : true
            }
        );
        if(data)
        {
            res.status(200).json({message : res.__('OTP_SEND'), data});
        }else{
            res.status(400).json({error : res.__('NO_USER_FOUND')});
        }   
    }else{
        res.status(400).json({error : res.__('PHONE_REQUIRED')});
    }
});

router.put('/forgot-password', async (req, res) => {
    const {_id, otp, password} = req.body;
    const data = await User.findById(_id);
    if(data)
    {
        if(data.otp == otp)
        {
            await User.updateOne(
                {
                    _id : _id
                },
                {
                    $set : {
                        password : password
                    }
                }
            )
            res.status(200).json({message : res.__('FORGOT_PASSWORD')});
        }else{
            res.status(400).json({error : res.__('INVALID_OTP')});
        }
    }else{
        res.status(400).json({error : res.__('FILLED_ALL_PROPERTY')});
    }
});

router.post("/login-otp", async (req, res) => {
    const {phone, userRole} = req.body;
    if(phone)
    {
        const data = await User.findOne({phone : phone});
        if(data)
        {
            if(data.userType == userRole){
                const randNumber = Math.floor(100000 + Math.random() * 900000);
        
            const smsData = {
                body : 'Your OnlineDoctors ID code is: '+randNumber+'. Do not share it with anyone.',
                to : data.country_dial_code+''+data.phone
            }
            let otp = randNumber;    
            const resp = await User.updateOne({
                _id : data._id
            },
            {
                $set : {
                    otp : randNumber
                }
            });
            try{
                const smsSend = await sendSMS(smsData);
            }catch(error)
            {
                console.log(error)
            }
           
            const respData = {
                _id : data._id,
                phone : data.phone,
                email : data.email
            }
                res.status(200).json({message : res.__('OTP_SEND'), respData});
            }else{
                req.status(400).json({error : res.__('UNAUTHORIZE_ROLE')});
            }
        }else{
            req.status(400).json({error : res.__('NO_USER_FOUND')});
        }
    }else{
        res.status(400).json({error : res.__('PHONE_REQUIRED')});
    }
});

router.post("/verify-login-otp", async (req, res) => {
    const { otp, phone, _id} = req.body;
    if(!otp || !phone || !_id)
    {
        return res.status(400).json({error : res.__('FILLED_ALL_PROPERTY')});
    }
    const data = await User.findOne({phone : phone, _id : _id});
    try {
        if(data)
        {
            var timeStart = new Date(data.updatedAt);
            var timeEnd = new Date();
            var minsdiff = Math.abs(timeEnd - timeStart); 
            minsdiff = Math.trunc(minsdiff/60/1000);
            if(process.env.OTP_VERIFY_TIME >= minsdiff)
            {
                if(data.otp == otp)
                {
                    var profile = '';
                    if(data.profile)
                    {
                        var splitProfile = data.profile.split("/");
                        profile = `${baseUrl}${splitProfile[3]}`;
                    }
                    const resp = {
                        'firstName' :  data.firstName,
                        'lastName' : data.lastName,
                        'email' : data.email,
                        'dob' : data.dob,
                        'profile' : profile
                    }
                    Jwt.sign({data}, JwtKey, {expiresIn:"120h"}, async (err, token) => {
                        if(err)
                        {
                            return res.status(400).json({error : res.__('ERROR_WENT_WRONG')});
                        }
                        const tokenData = {
                            _token : token,
                            userId : data._id,
                            login_device_type : !req.body.login_device_type ? 1 : req.body.login_device_type,
                            login_device_name : !req.body.login_device_name ? "Redmi Note 1" : req.body.login_device_name,
                            is_login : 1
                        };
                        const tokenModel =  new UserLoginDetails(tokenData);
                        const dataToken = await tokenModel.save();
                        if(dataToken){
                            if(req.body.login_device_type != 3)
                            {
                                const deviceData = {
                                    fcm_device_token : req.body.fcm_device_token,
                                    userId : data._id,
                                    login_device_type : !req.body.login_device_type ? 1 : req.body.login_device_type,
                                    login_device_name : !req.body.login_device_name ? "Redmi Note 1" : req.body.login_device_name,
                                };
                                saveUserDeviceDetail(deviceData);
                            }
                            res.status(200).json({ message: res.__('LOGIN'), user_role: data.userType.toLowerCase(),userId : data._id, auth : token, data :resp });
                        }else{
                            res.status(400).json({ message: res.__('ERROR_WENT_WRONG') });
                        }
                    })
                }else{
                    res.status(400).json({error : res.__('INVALID_OTP')});
                }
            }else{
                res.status(400).json({error : res.__('OTP_EXPIRED')})
            }
        }else{
            res.status(400).json({error : res.__('NO_USER_FOUND')});
        }
    }
    catch (error)
    {
        return res.status(400).json({error : error});
    }
  
})

router.post('/aws', uploadFile.array('file', 3), async (req, res, next) => {
    console.log("req?.file", req?.files)
    if(req.files)
    {
        const data = {
            url : req.files[0].location
        }
        return res.send({message : `Successfully uploaded ' + ${req.files.length} + ' files!'`, data} )
    }
    else{
        res.send("No File Upload");
    }
});

router.post("/chatboat", async (req, res) => {
    var {chatId, message} = req.body;
    if(!message)
    {
        return res.status(400).json({error : res.__('FILLED_ALL_PROPERTY')});
    }
    const questionData = await questions.FORMS;
    let next_stage  = '';
    let current_stage = '';
    let next_stage_index  = '';
    let current_stage_index = '';
    var text = '';
    var options = '';
    var questionsList = '';
    var form = '';
    if(!chatId)
    {
        var re = new RegExp("^(Hello|Hi|Hii|HELLO|HI|Hey)$");
        if(re.test(message)){
            text = "Hi there. How can I help?";
            options = [
                'Acne',
                'Cold',
                'Bladder',
                'Hair',
                'Others'
            ]
        }else{
            const jsonString = JSON.stringify(questionData);
            message = message.toUpperCase();
            if(jsonString.indexOf(message) !== -1)
            {
                let jsonFind = questionData[message];
                questionsList  = jsonFind['QUESTIONS'];
                form = message;
            }else{
                questionsList = questionData.DEFAULT.QUESTIONS;
                form = 'DEFAULT';
            }
        }
        if(questionsList)
        {
            let getKey = Object.keys(questionsList)[0];
            current_stage = Object.keys(questionsList)[0];
            next_stage = Object.keys(questionsList)[1];
            text = questionsList[getKey].question;
            options = questionsList[getKey].options
        }
        console.log('Text is', text.question);
        const chatBoatModel =  new chatboat({
            form : form,
            ip   : req.body.ip,
            status :  'Active',
            createdBy : req.body.userId ? req.body.userId : null
        });
        const data = await chatBoatModel.save();
        if(data._id)
        {
            chatboatItems.insertMany([{
                chatId : chatBoatModel._id,
                form   : form,
                current_stage : current_stage,
                next_stage    : next_stage,
                current_stage_index : 0,
                next_stage_index    : 1,
                text   : message,
                status : 'Active',
                type_id : 2,
                options : JSON.stringify(options),
                createdBy : req.body.userId ? req.body.userId : null
            },{
                chatId : chatBoatModel._id,
                form   : form,
                current_stage : current_stage,
                next_stage    : next_stage,
                current_stage_index : 0,
                next_stage_index    : 1,
                text   : text,
                status : 'Active',
                type_id : 1,
                options : JSON.stringify(options),
                createdBy : req.body.userId ? req.body.userId : null
            }]).then(() => {
                const result = {
                    chatId  : chatBoatModel._id,
                    text    : text,
                    options : options,
                    status  : chatBoatModel.status
                }
                return res.status(200).json({message : "chat", result});
            }).catch(function(err) {
                return res.status(400).json({error : err})                         
            }); 
        }else{
            return res.status(400).json({error : res.__('ERROR_WENT_WRONG')})
        }
    }else{
        const chatItem = await chatboatItems.findOne({
            chatId   : chatId,
            type_id : 1
        }).sort({"createdAt":-1});
        if(chatItem.form)
        {
            form = chatItem.form;
            let jsonFind = questionData[chatItem.form];
            questionsList  = jsonFind['QUESTIONS'];
            if(questionsList)
            {
                let getKey = Object.keys(questionsList)[chatItem.next_stage_index];
                current_stage = Object.keys(questionsList)[chatItem.next_stage_index];
                current_stage_index = chatItem.next_stage_index;
                next_stage = Object.keys(questionsList)[chatItem.next_stage_index + 1];
                next_stage_index = next_stage ? chatItem.next_stage_index + 1 : 0;
                text = questionsList[getKey].question;
                options = questionsList[getKey].options
            }
        }else{
            const jsonString = JSON.stringify(questionData);
            message = message.toUpperCase();
            if(jsonString.indexOf(message) !== -1)
            {
                let jsonFind = questionData[message];
                questionsList  = jsonFind['QUESTIONS'];
                form = message;
            }else{
                questionsList = questionData.DEFAULT.QUESTIONS;
                form = 'DEFAULT';
            }
           
            if(questionsList)
            {
                let getKey = Object.keys(questionsList)[0];
                current_stage = Object.keys(questionsList)[0];
                current_stage_index = 0;
                next_stage = Object.keys(questionsList)[1];
                next_stage_index = 1
                text = questionsList[getKey].question;
                options = questionsList[getKey].options
            }
        }
        const chatBoatModel = await chatboat.findOneAndUpdate({
            _id : chatId
        },{
            form : form,
            status : next_stage_index == 0 ? 'Complete' : 'Active',
        },{
            new : true
        });
        chatboatItems.insertMany([{
            chatId : chatId,
            form   : form,
            current_stage : current_stage,
            next_stage    : next_stage,
            current_stage_index : current_stage_index,
            next_stage_index    : next_stage_index,
            status : 1,
            text   : message,
            status : next_stage_index == 0 ? 'Complete' : 'Active',
            type_id : 2,
            options : JSON.stringify(options),
            createdBy : req.body.userId ? req.body.userId : null
        },{
            chatId : chatBoatModel._id,
            form   : form,
            current_stage : current_stage,
            next_stage    : next_stage,
            current_stage_index : current_stage_index,
            next_stage_index    : next_stage_index,
            status : 1,
            text   : text,
            status : next_stage_index == 0 ? 'Complete' : 'Active',
            type_id : 1,
            options : JSON.stringify(options),
            createdBy : req.body.userId ? req.body.userId : null
        }]).then(() => {
            const result = {
                chatId  : chatId,
                text    : text,
                options : options,
                status  : chatBoatModel.status
            }
            return res.status(200).json({message : "chat", result});
        }).catch(function(err) {
            console.log(err);                       
        });  
    }
});

router.post('/chat', async (req, res) => {
    const {chatId} = req.body;
    if(!chatId)
    {
        return res.status(400).json({error : res.__('FILLED_ALL_PROPERTY')});
    }
    const chatStatus = await chatboat.findById(chatId);
    const data = await chatboatItems.find({
        chatId : chatId
    }, {text : -1, status:-1, type_id : -1, options : -1 }).sort({createdAt : 1});

    res.status(200).json({message : "Chat List", status : chatStatus.status, data});
});


router.post('/hit-api', async (req, res) => {
    const {email} = req.body;
    console.log(req.method);
    console.log(req.params);
})
module.exports = router;