import "p5/lib/p5"
import * as faceapi from 'face-api.js';


const MODEL_URL = "/models"

export default function sketch (p) {
    try {
        let capture = null;
        var sendingImage = false;

        let faceDrawings = [];
        let callback = null;

        function showFaceDetectionData(data) {
            faceDrawings = data;
        }

        p.setup = async function () {
            await faceapi.loadSsdMobilenetv1Model('https://face-models-attendance.s3.amazonaws.com/models/').then(() => {
                console.log("SSD Mobile Net Loaded")
            });
            await faceapi.loadAgeGenderModel('https://face-models-attendance.s3.amazonaws.com/models/').then(() => {
                console.log("Age Gender Loaded")
            });;
            await faceapi.loadFaceExpressionModel('https://face-models-attendance.s3.amazonaws.com/models/').then(() => {
                console.log("Face Express Model Loaded")
            });;

            p.createCanvas(1280, 720);
            const constraints = {
                video: {
                mandatory: {
                    minWidth: 1280,
                    minHeight: 720
                },
                optional: [{ maxFrameRate: 40 }]
                },
                audio: false
            };

            capture = p.createCapture(constraints, () => {
            });

            
            capture.id("video_element");
            capture.size(1280, 720);
            capture.hide();
            
        };
    
        p.myCustomRedrawAccordingToNewPropsHandler = props => {
            if (props.markAttendance) {
                callback = props.markAttendance;
            }
        };

        p.draw = async () => {
                if (!capture) {
                    return;
                }
                capture.loadPixels()
                p.background(255);
                p.image(capture, 0, 0);      
                p.fill(0,0,0,0);
        
                faceDrawings.map((drawing) => {
                    if (drawing) {
                        p.textSize(15);
                        p.strokeWeight(1);
        
                        const textX = drawing.detection.box._x+drawing.detection.box._width;
                        const textY = drawing.detection.box._y+drawing.detection.box._height;
                        
                        const confidencetext = "Gender: "+ drawing.gender;
                        const textWidth = p.textWidth(confidencetext);
                        p.text(confidencetext, textX-textWidth-10, textY-60);
        
        
                        const agetext = "Age: "+ drawing.age.toFixed(0);
                        const ageTextWidth = p.textWidth(agetext);
                        p.text(agetext, textX-ageTextWidth-10, textY-30);
        
                        const copiedExpression = drawing.expressions;
                        const expressions = Object.keys(copiedExpression).map((key) => {
                            const value = copiedExpression[key];
                            return value;
                        })
        
                        const max = Math.max(...expressions);
                        
                        const expression_value = Object.keys(copiedExpression).filter((key) => {
                            return copiedExpression[key] === max; 
                        })[0];
        
                        const expressiontext = "Mood: "+ expression_value;
                        const expressionWidth = p.textWidth(expressiontext);
                        p.text(expressiontext, textX-expressionWidth-10, textY-10);
                        
                        p.strokeWeight(4);
                        p.stroke('rgb(100%,100%,100%)');
                        p.rect(drawing.detection.box._x, drawing.detection.box._y, drawing.detection.box._width, drawing.detection.box._height);
                    }
                    
                });
                faceapi.detectAllFaces(capture.id()).withAgeAndGender().withFaceExpressions().then((data) => {
                    showFaceDetectionData(data);
        
                    if(sendingImage) {
                        return;
                    } else {
                        if(data[0] !== undefined) {
                            if(data[0].detection.score > 0.97) {
                                sendingImage = true;
                                callback(capture.canvas.toDataURL("image/jpg"));
                            }
                            return;
                        }
                    }
                });
        }
    } catch (e) {
        console.error('e', e);
    }
  };