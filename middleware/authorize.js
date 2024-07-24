const express = require("express");
const Jwt = require('jsonwebtoken');
const User = require("../models/User");
const UserLoginDetails = require("../models/UserLoginDetails");
const JwtKey = process.env.PROJECT_NAME;

const token = (req,resp,next) => {
    let token = req.headers['authorization'];
    if(token)
    {
        let splittoken = token.split(" ");
        if(!splittoken[1])
        {
            token = token;
        }else{
            token = splittoken[1];
        }
        Jwt.verify(token, JwtKey, async (err, valid) => {
            if(err)
            {
                resp.status(401).send({status : 401, message : resp.__('VALID_TOKEN')});
            }else{
                const loginToken = await UserLoginDetails.findOne({
                    userId : valid.data._id
                }).sort({"createdAt":-1});
                if(loginToken.login_device_type === 3)
                {
                    User.findOne({_id: valid.data._id}).then(function(user){
                        // Do something with the user
                        req.getUserProfile = user;
                        next();
                    });
                }
                else if(loginToken._token === token)
                {
                    User.findOne({_id: valid.data._id}).then(function(user){
                        // Do something with the user
                        req.getUserProfile = user;
                        next();
                    });
                }else{
                    resp.status(401).send({status : 401, message : resp.__('VALID_TOKEN')});
                }
            }
        })
    }else{
        resp.status(401).send({status : 401, message : resp.__('UNAUTHORIZE_USER')})
    }
   
}

module.exports = token;