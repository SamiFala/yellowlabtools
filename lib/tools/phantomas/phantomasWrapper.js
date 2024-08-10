var async                   = require('async');
var Q                       = require('q');
var path                    = require('path');
var debug                   = require('debug')('ylt:phantomaswrapper');
var phantomas               = require('phantomas');


var PhantomasWrapper = function() {
    'use strict';

    /**
     * This is the phantomas launcher. It merges user chosen options into the default options
     */
    this.execute = function(data) {

        var deferred = Q.defer();
        var task = data.params;

        var viewportOption = null;
        // Setting screen dimensions for desktop devices only.
        // Phone and tablet dimensions are dealt by Phantomas.
        if (task.options.device === 'desktop') {
            // Similar to an old non-retina Macbook Air 13"
            viewportOption = '1280x800x1';
        } else if (task.options.device === 'desktop-hd') {
            // Similar to a retina Macbook Pro 16"
            viewportOption = '1536x960x2';
        }

        var options = {
            
            // Cusomizable options
            'timeout': task.options.timeout || 120,
            'user-agent': (task.options.device === 'desktop') ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) YLT Chrome/85.0.4183.121 Safari/537.36' : null,
            'tablet': (task.options.device === 'tablet'),
            'phone': (task.options.device === 'phone'),
            'screenshot': task.options.screenshot || false,
            'viewport': viewportOption,
            'wait-for-network-idle': true,
            'cookie': task.options.cookie,
            'auth-user': task.options.authUser,
            'auth-pass': task.options.authPass,
            'block-domain': task.options.blockDomain,
            'allow-domain': task.options.allowDomain,
            'no-externals': task.options.noExternals,
            'local-storage': task.options.localStorage,
            'session-storage': task.options.sessionStorage,

            // Mandatory
            'analyze-css': true,
            'ignoreSslErrors': true, // until Phantomas 2.1
            'ignore-ssl-errors': true // for Phantomas >= 2.2
        };


        // Proxy option can't be set to null or undefined...
        // this is why it's set now and not in the object above
        if (task.options.proxy) {
            options.proxy = task.options.proxy;
        }

        var debugCmd = 'DEBUG=* node node_modules/phantomas/bin/phantomas.js --url ' + task.url;
        Object.keys(options).forEach(function(key) {
            if (key !== 'wait-for-network-idle' && options[key] !== null) {
                debugCmd += ' --' + key + ' ' + options[key];
            }
        });
        debug('If you want to run Phantomas alone for debugging purpose, this is the command: %s', debugCmd);

        // It's time to launch the test!!!
    
        const promise = phantomas(task.url, options);

        // handle the promise
        promise.
            then(results => {
                var json = {
                    generator: results.getGenerator(),
                    url: results.getUrl(),
                    metrics: results.getMetrics(),
                    offenders: results.getAllOffenders()
                };

                deferred.resolve(json);
            }).
            catch(error => {
                console.error('Phantomas execution failed:', error);
                // Pour débugger, on peut vouloir voir plus de détails de l'erreur
                console.error(JSON.stringify(error, null, 2));
                deferred.reject('Phantomas failed: ' + error.message);
            });
            /*catch(res => {
                console.error(res);
                deferred.reject('Phantomas failed: ' + res.message);
            });*/
            

        promise.on('milestone', function(event) {
            if (event === 'domReady' || event === 'domComplete') {
                deferred.notify(event);
            }
        });

        return deferred.promise;
    };
};

module.exports = new PhantomasWrapper();