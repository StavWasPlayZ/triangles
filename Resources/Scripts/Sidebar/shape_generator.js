// Add sidebar button functionality
const shapeBtns = document.getElementById("shapepicker").children;

for (let i = 0; i < shapeBtns.length; i++) {
    const shapeBtn = shapeBtns[i];
    for (let j = 0; j < button_shapes.length; j++) {
        const shapeObj = button_shapes[j];

        if (shapeBtn.id === shapeObj.shape) {
            shapeBtn.addEventListener("click", () => {
                closeHintBox();
                generateShape(shapeObj);
            });
            break;
        }
    }
}



// IDN = ID Number
// Shape IDN
    sIdn = 0;

/**
 * idn -> point
 * sidn -> genobj
 * 
 * object type -> genobj[]
 * points of type object -> point[]
 */
let points = [];

// Shape generator
function generateShape(shapeObj) {
    const thisSIdn = sIdn++;

    // Create shape container
    const container = document.createElement("div");
    container.classList.add("genobj", shapeObj.shape+"o");
    container.draggable = false;
    if (shapeObj.container_style != undefined)
        container.style = shapeObj.container_style;
    canvas.appendChild(container);

    let pointContainer = undefined;
    // Generate points
    if (shapeObj.points != undefined) {
        pointContainer = document.createElement("div");
        pointContainer.classList.add("points");
        pointContainer.setAttribute("sidn", thisSIdn);

        let base, prevPoint;
        container.appendChild(pointContainer);
        for (let k = 0; k < shapeObj.points.length; k++) {
            const pointObj = shapeObj.points[k];
            if (pointObj.base) {
                base = pointObj;
                continue;
            }

            const point = document.createElement("div");
            

            // Add classes
            point.className = pointObj.class;
            point.classList.add("opoint");
            point.setAttribute("idn", points.length);
            point.setAttribute("sidn", thisSIdn);

            points.push(point);

            
            // Apply style
            point.style = ranPos((((base != undefined) && (base.style != undefined)) ? base.style+" " : "") +
                ((pointObj.style != undefined) ? pointObj.style : ""));
            if (pointObj.offset_left != undefined) {
                point.style.left = prevPoint.offsetLeft + pointObj.offset_left+"px";
                point.style.top = prevPoint.offsetTop+"px";
            }

            // Attach events
            let functions = base.functions;
            functions =
                  (functions == undefined) ? pointObj.functions
                : (pointObj.functions != undefined) ? functions.concat(pointObj.functions)
                : functions;
            if (functions != undefined)
                for (let i = 0; i < functions.length; i++)
                    registerFunction(point, functions[i])

            pointContainer.appendChild(point);
            prevPoint = point;
        }
    }

    // Generate Shape
    const shape = (shapeObj.element_func == undefined) ? document.createElement("div") : shapeObj.element_func();
    shape.classList.add("shape");
    shape.classList.add("sgenobj");
    shape.classList.add(shapeObj.shape+"so");

    shape.setAttribute("sidn", thisSIdn);


    setLeft = (shapeObj.set_left == undefined) ? ((element, value) => (element.style.left = value)) : shapeObj.set_left;
    getLeft = (shapeObj.get_left == undefined) ? ((element) => element.offsetLeft) : shapeObj.get_left;
    setTop = (shapeObj.set_top == undefined) ? ((element, value) => (element.style.top = value)) : shapeObj.set_top;
    getTop = (shapeObj.get_top == undefined) ? ((element) => element.offsetTop) : shapeObj.get_top;

    if (shapeObj.style != undefined)
        shape.style = ranPos(shapeObj.style);
    if ((pointContainer != undefined) && (shapeObj.attach_pos != undefined)) {
        setLeft(shape, pointContainer.querySelector("."+shapeObj.attach_pos).offsetLeft
            +((shapeObj.offset != undefined) ? shapeObj.offset.left : 0)+"px");
        setTop(shape, pointContainer.querySelector("."+shapeObj.attach_pos).offsetTop
            +((shapeObj.offset != undefined) ? shapeObj.offset.top : 0)+"px");
    }
    if (shapeObj.functions != undefined)
        for (let i = 0; i < shapeObj.functions.length; i++)
            registerFunction(shape, shapeObj.functions[i]);
    if (shapeObj.allow_width_text) {
        const textContainer = document.createElement("div");
        textContainer.classList.add("textContainer");
        shape.appendChild(textContainer);

        textContainer.innerText = texttoggle_enabled ? "100px" : "";
        texttoggle_functions[texttoggle_functions.length] = (isEnabled) => {
            textContainer.innerText = isEnabled ? shape.offsetWidth+"px" : "";
        }
        canvas.addEventListener("pointermove", () => {
            if (texttoggle_enabled) {
                textContainer.innerText = shape.offsetWidth+"px";
                if (shapeObj.enable_width_rotation)
                    textContainer.style.transform = shape.hasAttribute("mirror") ? "scale(-1, -1)" : "scale(1, 1)";
            }
        })
    }

    
    if (shapeObj.parent_container == undefined) {
        if (container.children.length != 0)
            container.insertBefore(shape, container.firstChild);
        else
            container.appendChild(shape);
    } else
        shapeObj.parent_container(shape);

    const shapeComputedStyle = window.getComputedStyle(shape);
    shape.style.width = shapeComputedStyle.width;
    shape.style.height = shapeComputedStyle.height;
}
function registerFunction(element, funcObj) {
    (funcObj.apply_on_canvas ? canvas : element).addEventListener(funcObj.event_name, (event) => {
        if (!documentElement.classList.contains("picking"))
            funcObj.function(event, element);
    });
}

const genRanPos = (max, lowerPercentage = .75, margin = 15) =>
    ranNum(max * lowerPercentage - margin) + margin;
const ranPos = (style) =>
    style.replace("%rw", genRanPos(window.innerWidth)).replace("%rh", genRanPos(window.innerHeight));