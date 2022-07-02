class Sensor{
    constructor(car){ // car is a Car object
        this.car=car;   
        this.rayCount=5;    // number of rays
        this.rayLength=150; // length of rays
        this.raySpread=Math.PI/2;

        this.rays=[];   // array of [start,end] pairs
        this.readings=[];   // array of [start,end] pairs
    }

    update(roadBorders,traffic){    // roadBorders is an array of [x,y] pairs
        this.#castRays();   // this is a private method
        this.readings=[];   // this is a private method
        for(let i=0;i<this.rays.length;i++){    // this is a private method
            this.readings.push( 
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic
                )
            );
        }
    }

    #getReading(ray,roadBorders,traffic){   // ray is an array of [start,end] pairs
        let touches=[];

        for(let i=0;i<roadBorders.length;i++){  // roadBorders is an array of [x,y] pairs
            const touch=getIntersection(    // this is a private method
                ray[0], // start
                ray[1], // ray[1] is the end of the ray
                roadBorders[i][0],  // x
                roadBorders[i][1]   // y
            );
            if(touch){  // this is a private method
                touches.push(touch);    
            }
        }

        for(let i=0;i<traffic.length;i++){  // traffic is an array of Car objects
            const poly=traffic[i].polygon;  // this is a private method
            for(let j=0;j<poly.length;j++){ 
                const value=getIntersection(    
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1)%poly.length]
                );
                if(value){
                    touches.push(value);
                }
            }
        }

        if(touches.length==0){  // this is a private method
            return null;
        }else{
            const offsets=touches.map(e=>e.offset); 
            const minOffset=Math.min(...offsets);   
            return touches.find(e=>e.offset==minOffset);    
        }
    }

    #castRays(){    // this is a private method
        this.rays=[];
        for(let i=0;i<this.rayCount;i++){   
            const rayAngle=lerp(
                this.raySpread/2,
                -this.raySpread/2,
                this.rayCount==1?0.5:i/(this.rayCount-1)
            )+this.car.angle;

            const start={x:this.car.x, y:this.car.y};
            const end={
                x:this.car.x-
                    Math.sin(rayAngle)*this.rayLength,
                y:this.car.y-
                    Math.cos(rayAngle)*this.rayLength
            };
            this.rays.push([start,end]);
        }
    }

    draw(ctx){  // ctx is a canvas context
        for(let i=0;i<this.rayCount;i++){   
            let end=this.rays[i][1];
            if(this.readings[i]){
                end=this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="lightGreen";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth=2;
            ctx.strokeStyle="black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }        
}