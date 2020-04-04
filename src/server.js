'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs').promises;

app.use(express.static('public'));

app.get('*', (req, res) => {
  var options = { headers: {'content-type': 'text/html'}}
  res.sendFile(__dirname + '/index.html', options);
});

// Constants
const PORT = process.env.WEBPORT || 8080;
// if you're not using docker-compose for local development, this will default to 8080
// to prevent non-root permission problems with 80. Dockerfile is set to make this 80
// because containers don't have that issue :)

const server = app.listen(PORT, () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Timr listening at http://%s:%s', host, port);
});

//
// need this in docker container to properly exit since node doesn't handle SIGINT/SIGTERM
// this also won't work on using npm start since:
// https://github.com/npm/npm/issues/4603
// https://github.com/npm/npm/pull/10868
// https://github.com/RisingStack/kubernetes-graceful-shutdown-example/blob/master/src/index.js
// if you want to use npm then start with `docker run --init` to help, but I still don't think it's
// a graceful shutdown of node process
//

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
  console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
  console.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
  shutdown();
})

function calcSolarLunarAngle(sun, moon) {
    if (Math.abs (moon - sun) > 180) {
      return 360 - Math.abs (moon - sun)
    }     
   return Math.abs (moon - sun)
}

// shut down server
function shutdown() {
  server.close(function onServerClosed (err) {
    if (err) {
      console.error(err);
      process.exitCode = 1;
    }
    process.exit();
  })
}
//
// need above in docker container to properly exit
//
