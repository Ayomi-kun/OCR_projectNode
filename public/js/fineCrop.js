(function ($) {
    $.fn.finecrop = function (options) {

        var defaults = {
            viewHeight: 0,
            cropWidth: 200,
            cropHeight: 200,
            cropInput: 'myImage',
            cropOutput: 'mysource',
            zoomValue: 10
        };
        var settings = $.extend({}, defaults, options);
        return this.each(function () {
            var $obj = $(this);
            $($obj).change(function () {
                if (this.files && this.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        $('#' + settings.cropInput).attr('src', e.target.result).css('opacity', 0);
                        $('#' + settings.cropInput).attr('height', settings.viewHeight + 'px')
                        $(".cropHolder").show();
                        setTimeout(function () {
                            cropstart();
                        }, 1000);

                    };
                    reader.readAsDataURL(this.files[0]);
                }
            });

            function cropstart() {
                /* Let's Create canvas and backgrounds
                 * First : background canvas, it will behind all
                 * Second : transparent background
                 * Third: 2nd canvas, where image will get cropped 
                 */
                var cropContainer = $("#cropWrapper");
                var bgcanvas = document.createElement('canvas');
                bgcanvas.id = 'bgCanvas';
                bgcanvas.style.border = '1px solid #000';
                $(cropContainer).append(bgcanvas);

                // black sheet div
                var blacksheet = document.createElement('div');
                blacksheet.id = 'blacksheet';
                $(cropContainer).append(blacksheet);

                // cropped canvas
                var getCropped = document.createElement('canvas');
                getCropped.id = 'getCropped';
                getCropped.width = settings.cropWidth;
                getCropped.height = settings.cropHeight;
                getCropped.style.border = '1px solid #000';
                $(cropContainer).append(getCropped);



                /* CONSTANT
                 * These two variable are constant as the actual width or height of an image is constant
                 * 1. imgSrc : source of Image
                 * 2. actualWidth : Natural width of image
                 * 3. actualHeight : Natural height of image
                 */
                var imgSrc = document.getElementById(settings.cropInput); //$("#myImage");
                var actualWidth = imgSrc.naturalWidth;
                var actualHeight = imgSrc.naturalHeight;
                var zoomValue = 0; // initial

                // imgSrc.setAttribute('height', 500 + 'px'); // initial

                var moveHorizontal = document.getElementById('xmove');
                var moveVertical = document.getElementById('ymove');
                var zoomIn = document.getElementById("zplus");
                var zoomOut = document.getElementById("zminus");



                var elemWidth, elemHeight, lValue, tValue;

                function getImgRef() {
                    elemWidth = imgSrc.width;
                    elemHeight = imgSrc.height;
                    lValue = (elemWidth - settings.cropWidth) / 2;
                    tValue = (elemHeight - settings.cropHeight) / 2;
                    // --- dynamic max values ---
                    moveHorizontal.setAttribute('max', (elemWidth - settings.cropWidth));
                    moveVertical.setAttribute('max', (elemHeight - settings.cropHeight));

                    moveHorizontal.setAttribute('value', (elemWidth - settings.cropWidth) / 2);
                    moveVertical.setAttribute('value', (elemHeight - settings.cropHeight) / 2);

                }
                getImgRef();


                document.getElementById("zplus").onclick = function () {
                    var imgSrcHeight = parseInt(imgSrc.getAttribute('height'));
                    imgSrc.setAttribute('height', (imgSrcHeight + settings.zoomValue) + 'px');
                    getImgRef();
                    bgCanvas(lValue, tValue);
                }
                document.getElementById("zminus").onclick = function () {
                    var imgSrcHeight = parseInt(imgSrc.getAttribute('height'));
                    imgSrc.setAttribute('height', (imgSrcHeight - settings.zoomValue) + 'px');
                    getImgRef();
                    bgCanvas(lValue, tValue);
                }
                document.getElementById('cropSubmit').onclick = function () {
                    $("#" + settings.cropOutput).attr('src', getCropped.toDataURL());
                    $(bgcanvas).remove();
                    $(blacksheet).remove();
                    $(getCropped).remove();
                    $(".cropHolder").hide();
                }
                document.getElementById("closeCrop").onclick = function(){
                    $(bgcanvas).remove();
                    $(blacksheet).remove();
                    $(getCropped).remove();
                    $(".cropHolder").hide();
                }
                // ------------- -------- drawImage properties ---------- -----------------
                function cropCanvas(x, y) {

                    var imgSrcC = bgcanvas;
                    var context = getCropped.getContext("2d");

                    var cwidth = getCropped.width;
                    var cheight = getCropped.height;
                    
                    var sx = (elemWidth - cwidth) / 2;
                    var sy = (elemHeight - cheight) / 2;
                    var swidth = cwidth;
                    var sheight = cheight;

                    var dwidth = cwidth;
                    var dheight = cheight;

                    context.clearRect(0, 0, cwidth, cheight);
                    context.drawImage(imgSrcC, sx, sy, swidth, sheight, 0, 0, dwidth, dheight);
                    // img, sx, sy, swidth, sheight, dx, dy, dwidth, dheight
                    // s = source
                    // d = destination
                };


                // --------------- bg canvas -------------------
                function bgCanvas(x, y) {
                    lValue = x;
                    tValue = y;

                    var context = bgcanvas.getContext("2d");

                    var cwidth = elemWidth;
                    var cheight = elemHeight;
                    bgcanvas.width = cwidth;
                    bgcanvas.height = cheight;
                    context.clearRect(0, 0, cwidth, cheight);
                    /*
                     * To ensure the perspective of an image, here is the calculation for new width and height
                     * nw/nh = w/h;
                     * nh = (h*nw)/w;
                     + these below 'minus' lines are not in use anymore 
                     - var dwidth = cwidth + zoomValue;
                     - var dheight = (cheight * (cwidth + zoomValue))/cwidth;
                     */


                    var dwidth = cwidth;
                    var dheight = cheight;

                    var sx = (((x - (elemWidth - settings.cropWidth) / 2) * actualWidth) / elemWidth) + zoomValue;
                    var sy = (((y - (elemHeight - settings.cropHeight) / 2) * actualHeight) / elemHeight);
                    var swidth = (cwidth * actualWidth) / elemWidth;
                    var sheight = (cheight * actualHeight) / elemHeight;
                    
                    context.drawImage(imgSrc, sx, sy, swidth, sheight, 0, 0, dwidth, dheight);
                    cropCanvas(x, y);
                };

                bgCanvas(lValue, tValue);
                /* get the current input
                   for IE, 'oninput' doesn't work, should use 'onchange' 
                */
                if (navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1)) {
                    alert("please do not use IE :) ");
                } else {
                    moveHorizontal.oninput = function (event) {
                        bgCanvas(event.target.value, tValue)
                    }
                    moveVertical.oninput = function (event) {
                        bgCanvas(lValue, event.target.value);
                    }
                }
            }
        });
    };
}(jQuery));