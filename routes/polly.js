'use strict';

const Joi = require('joi');
const Boom = require('boom');
var stream = require('stream');
var path = require('path');
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./polly.json');

exports.register = function (server, options, next) {
    //fetch all students
    server.route({
        method: 'POST',
        path: '/polly/create',
        config: {
            validate: {
                payload: {
                    text : Joi.string().required()
                }
            }
        },
        handler: function(request, reply) {
            const polly = new AWS.Polly();
            const text = request.payload.text;

            polly.describeVoices({ LanguageCode: 'en-US' }, function (err, data) {
                if (err) throw err; // an error occurred
            })

            const params = {
                OutputFormat: 'mp3',               // You can also specify pcm or ogg_vorbis formats.
                Text: text,     // This is where you'll specify whatever text you want to render.
                VoiceId: 'Joanna'                   // Specify the voice ID / name from the previous step.
            };

            polly.synthesizeSpeech(params, (err, data) => {
              if (err) throw err; // an error occurred
              const bufferStream = new stream.PassThrough();
              bufferStream.end(new Buffer(data.AudioStream));
              reply(bufferStream).header('Content-Type', 'audio/mpeg');
            });
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-polly'
};
