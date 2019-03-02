var express = require('express');
var app = express();
var multer = require('multer');
var Tesseract = require('tesseract.js')
// var filename = 'pic.jpg';
// var upload = multer({ dest: 'uploads/' });
var bodyParser = require('body-parser');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
   
  var upload = multer({ storage: storage })

function tesseract (filename) {
    let output = '';
    Tesseract.recognize(filename)
  .progress(function  (p) { console.log('progress', p)  })
  .catch(err => console.error(err))
  .then(function (result) {
    // console.log(result.text)
    output = result.text;
  })
  return output;
}
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())
  app.use(express.static('public'));

  app.post('/upload',upload.single('image'), (req,res,next) => {
      console.log(req.file);
      const imagepath = `${req.file.destination}${req.file.originalname}`;
      Tesseract.recognize(imagepath)
        .progress(function  (p) { console.log('progress', p)  })
        .catch(err => console.error(err))
        .then(function (result) {
            // console.log(result.text)
            let output = result.text;
            res.send(output);
            console.log(output);
        })
  })

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    console.log(err);
    res.render('error',{error:err});
  });
const PORT = process.env.PORT || 8000;
  app.listen(8000,() => {
      console.log(`server running on http://localhost:${PORT}`);
      
  })