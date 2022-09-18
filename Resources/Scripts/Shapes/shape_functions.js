const canvas = document.getElementById("canvas"), degreeRenderer = canvas.querySelector("#degreeRenderer");




//#region General Functions


//#region Points
/**
 * The map that stores every point's snipping attribute. Key is defined by IDN.
 * @type {Map<HTMLElement, HTMLElement[]>}
 */
const sniplists = new Map();

/**
 * Prepares this {@link element} to be dragged by applying it the attribute "drag".
 * 
 * This attribute representaion is as follows:
 * 
 * `[Left: Initial click position] [Right: Initial click position] [Left: Initial `{@link element}` position] [Right: Initial element position]
 * <Additional args>`
 * 
 * @param {Event} event 
 * @param {HTMLElement} element 
 * @param {string} additionalArgs Anything else that you'd like to add to the attribute's string? (seperate each value by a space!)
 * @param {number | string} customLeft If this element doesn't use the 'left' CSS attribute to move on screen, specify the property here.
 * @param {number | string} customTop If this element doesn't use the 'right' CSS attribute to move on screen, specify the property here.
 */
function setDrag(event, element, additionalArgs = "", customLeft = element.offsetLeft, customTop = element.offsetTop) {
    element.setAttribute("drag", event.clientX+" "+event.clientY+" "+
        parseInt(customLeft)+" "+parseInt(customTop)+
        ((additionalArgs == "") ? "" : (" "+additionalArgs)));
}
/**
 * Drags an {@link element} according to the client's mouse position stored in {@link event}.
 * @param {Event} event 
 * @param {HTMLElement} element 
 * @param {boolean} justReturn Should this function move this element by itself (left and top) or return the new coordinate values?
 * @returns Either nothing or an array representing a coordinate, depending on {@link justReturn}.
 */
function drag(event, element, justReturn) {
    const drag = element.getAttribute("drag").split(" ");

    const top = parseInt(drag[3]) + event.clientY - parseInt(drag[1])+"px",
        left = parseInt(drag[2]) + event.clientX - parseInt(drag[0])+"px";


    if (justReturn)
        return [top, left];

    element.style.top = top;
    element.style.left = left;
}

function snip(event, element) {
    const sibling = getFirstSibling(element);
    const hWidth = element.offsetWidth/2,
        left = event.clientX - hWidth,
        top = event.clientY - hWidth;
    

    points.forEach((point) => {
        // If point is in the same shape
        if ((point == element) || (point == sibling))
            return;
        // If point is already snipped
        if (point.offsetWidth === 0)
            return;

        const pointIdn = point.getAttribute("idn");

        // If sibling is attached to the same point
        if (sibling.hasAttribute("snip") && (sibling.getAttribute("snip") === pointIdn))
            return;

        const sniplist = sniplists.get(element);
        if (sniplist != null) {
            // Iterate through this element's sniplist
            for (let i = 0; i < sniplist.length; i++) {
                // The snipped point's sibling
                const snippedPointSibling = getFirstSibling(sniplist[i]);
                
                // If said sibling is the point
                if (snippedPointSibling.getAttribute("idn") == pointIdn)
                    return;
                // Or is snipped to it
                if (snippedPointSibling.hasAttribute("snip") && (snippedPointSibling.getAttribute("snip") == pointIdn))
                    return;
            }
        }

        // If the element is snipped but unrelated to this point
        if (element.hasAttribute("snip") &&
          element.getAttribute("snip") !== point.getAttribute("idn"))
            return;
        
        
        const pointLeft = point.offsetLeft - hWidth,
            pointTop = point.offsetTop - hWidth;
        
        // Check for squared "radius", x then y
        if (((pointLeft-snip_radius) < left) && ((pointLeft+snip_radius) > left) &&
          ((pointTop-snip_radius) < top) && ((pointTop+snip_radius) > top)) {
            element.setAttribute("snip", point.getAttribute("idn"))
            element.style.left = point.style.left;
            element.style.top = point.style.top;
        } else
            element.removeAttribute("snip");
    });
}
function snipDrag(event, element, moveSelf) {
    if (moveSelf && !element.hasAttribute("snip"))
        drag(event, element);

    const sniplist = sniplists.get(element);
    if (sniplist == undefined)
        return;
    
        
    for (let i = 0; i < sniplist.length; i++) {
        const point = sniplist[i];
        point.setAttribute("drag", element.getAttribute("drag"));
        drag(event, point);
    }
}
function snipUp(element, additionalFunc = null) {
    dumbBroswerTightenPoint(element, additionalFunc);

    if (!element.hasAttribute("snip") || (element.offsetWidth === 0))
        return;

    element.style.width = "0";
    element.style.height = "0";


    const point = getPointByIdn(element.getAttribute("snip")), pointIdn = point.getAttribute("idn"),
        pointSniplist = sniplists.has(point) ? sniplists.get(point) : sniplists.set(point, []).get(point);
    pointSniplist.push(element);
    

    const sniplist = sniplists.get(element);
    if (sniplist == undefined)
        return;


    const newSniplist = pointSniplist.concat(sniplist);

    for (let i = 0; i < sniplist.length; i++)
        sniplist[i].setAttribute("snip", pointIdn);

    sniplists.delete(element);
    sniplists.set(point, newSniplist);
}
const timeout = 500, iterations = 2;
/**
 * For dumb browswers (IE [ig], Edge, Chrome, etc.), just makes sure this point's snipped elements stay in-tact.
 * Delays the function by {@link timeout} milliseconds {@link iterations iteration} times.
 * 
 * @param {HTMLElement} point ..the point
 * @param {function} additionalFunc any other function to call upon the point's tightning event
 */
function dumbBroswerTightenPoint(point, additionalFunc = null) {
    const sniplist = sniplists.get(point);
    if (sniplist == undefined)
        return;
    
    for (let i = 0; i < iterations; i++)
        setTimeout(() => {

            for (let j = 0; j < sniplist.length; j++) {
                const element = sniplist[j], elementStyle = element.style;

                elementStyle.left = point.style.left;
                elementStyle.top = point.style.top;

                if (additionalFunc != null)
                    additionalFunc(element);
            }

        }, timeout*i);
}

function getFirstSibling(element) {
    for (let i = 0; i < element.parentNode.children.length; i++) {
        const child = element.parentNode.children[i];
        if (child != element)
            return child
    }
}

//TODO: use or delete
const getPointContainer = (element, name) =>
    canvas.querySelector(`.${((name == undefined) ? "genobj" : (name+"o"))}>.points[sidn='${element.getAttribute("sidn")}']`);

const getPointByIdn = (idn) =>
    points[idn];

//#endregion

//#region Shapes

/**
 * Applies the attribute "drag" to this shape, along with its point coordinates as additional arguments, in their hierarchical order.
 * @param {Event} event 
 * @param {HTMLElement} element 
 * @param {HTMLElement} points A container for the points of this {@link element}'s shape
 * @param {number | string} customLeft If this element doesn't use the 'left' CSS attribute to move on screen, specify the property here.
 * @param {number | string} customTop If this element doesn't use the 'right' CSS attribute to move on screen, specify the property here.
 * 
 * @see {@link setDrag}
 */
function shapeDragBegin(event, element, points, customLeft, customTop) {
    let top = [0, 0], left = [0, 0];
    for (let i = 0; i < points.children.length; i++) {
        const point = points.children[i];
        top[i] = point.offsetTop;
        left[i] = point.offsetLeft;
    }

    setDrag(event, element, top[0]+" "+left[0]+" "+top[1]+" "+left[1], customLeft, customTop);
}
function shapeDrag(event, element, _drag, points, justReturn) {
    const result = drag(event, element, justReturn);

    // Move points along with shape
    for (let i = 0; i < points.children.length; i++) {
        const point = points.children[i];
        point.style.top = parseInt(_drag[4+i*2]) + event.clientY-parseInt(_drag[1])+"px";
        point.style.left = parseInt(_drag[4+i*2+1]) + event.clientX-parseInt(_drag[0])+"px";
    }

    return result;
}

/**
 * Upon movement, makes sure that if the {@link element} is snipped, it will get snipped out after {@link snip_radius a certain radius}.
 * When the element detaches from its points, the attribute "leftM" will be added to said element.
 * @param {Event} event 
 * @param {HTMLElement} element 
 * @param {string} _drag The drag attribute of this {@link element}
 * @param {HTMLDivElement} points The points associated with this {@link element}
 * @returns {boolean} Wether this {@link element} is still snipped
 */
function snipDetachment(event, element, _drag, points) {
    if (element.hasAttribute("leftM"))
        return false;


    // Iterate through this element's points
    for (let i = 0; i < points.children.length; i++) {
        const point = points.children[i];

        if (point.hasAttribute("snip") || sniplists.has(point)) {
            //FIXME ..get good at math (pythagorean theorem)
            if (Math.abs((parseInt(_drag[0]) - event.clientX) + (parseInt(_drag[1]) - event.clientY)) < (snip_radius/2))
                return true;


            //  If this point is snipped to another point, remove it from its sniplist
            if (point.hasAttribute("snip")) {
                const snippedPoint = getPointByIdn(point.getAttribute("snip")),
                    snippedSniplist = sniplists.get(snippedPoint);

                snippedSniplist.splice(snippedSniplist.indexOf(point), 1);

                // If said sniplist is empty after the removal, just remove the whole list
                if (snippedSniplist.length == 0)
                    sniplists.delete(snippedPoint);

                recoverPoint(point);
            }
            // Otherwise, remove this sniplist
            else {
                const pointSniplist = sniplists.get(point);

                // If there is only but a single point in the list, just recover it
                if (pointSniplist.length == 1) 
                    recoverPoint(pointSniplist[0]);
                // Otherwise, transfer said list to the first point in it
                else {
                    const chosenOne = pointSniplist[0];
                    // remove the chosen boi from its own list
                    pointSniplist.splice(0, 1);
                    sniplists.set(chosenOne, pointSniplist);
                    
                    recoverPoint(chosenOne);

                    const chosenIdn = chosenOne.getAttribute("idn");
                    for (let j = 0; j < pointSniplist.length; j++)
                        pointSniplist[j].setAttribute("snip", chosenIdn);
                }

                sniplists.delete(point);
            }

            element.setAttribute("leftM", "");
        }
    }

    return false;
}
function recoverPoint(point) {
    point.style.width = point.style.height = "20px";
    point.removeAttribute("snip");
}


/**
 * Rotates this {@link element} according to the {@link Math.atan2} formula.
 * @param {HTMLElement} element 
 * @param {number} a 
 * @param {number} b 
 * @param {boolean} isLeft Is the point calling this function a left point? (rotates by 180 accordingly)
 * @returns The rotation value
 */
function set2PointRot(element, a, b, isLeft) {
    const result = Math.atan2(a, b) + (!isLeft ? Math.PI : 0);
    setRotation(element, result);
    return result;
}

/**
 * @param {HTMLElement} element 
 * @param {boolean} parse Should the result be parsed into a float?
 * @returns This {@link element}'s rotation value in the 'transform' CSS field. Most likely in radians.
 */
function getRotation(element, parse = true) {
    let transform = element.style.transform;
    transform = transform.substring(transform.indexOf("rotate"));
    if (!transform)
        return;

    const result = transform.substring(transform.indexOf("(")+1, transform.indexOf(")"));
    return parse ? parseFloat(result) : result;
}
/**
 * Sests the rotation of this {@link element} to {@link value} in radians.
 * @param {HTMLElement} element
 * @param {number} value
 */
function setRotation(element, value) {
    const elementStyle = element.style, transform = elementStyle.transform;

    const insertValue = `rotate(${value}rad)`;
    elementStyle.transform = transform.includes("rotate") ?
        transform.replace(`rotate(${getRotation(element, false)})`, insertValue)
        // it does the trimming job automatically
        : transform + " " + insertValue;

}

// General
function ranNum(max) {
    return Math.floor(Math.random() * max);
}

//#endregion

//#endregion



function dragLine(element) {
    const left = element.classList.contains("left");

    
    const line = element.parentNode.parentNode.firstChild, lineStyle = line.style;
    const sibling = getFirstSibling(element);
    
    const a = sibling.offsetTop - element.offsetTop, b = sibling.offsetLeft - element.offsetLeft;
    

    lineStyle.width = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))+"px";

    if (left) {
        lineStyle.left = element.offsetLeft + 20/2+"px";
        lineStyle.top = element.offsetTop + 20/4+"px";
    }

    if (!line.hasAttribute("mirror")) {
        if (left ? (b <= 0) : (b >= 0)) 
            line.setAttribute("mirror", "");
        
    } else if (left ? (b >= 0) : (b <= 0)) 
        line.removeAttribute("mirror");
    

    set2PointRot(line, a, b, left);
    
}



getDefRadius = () => parseInt(window.getComputedStyle(document.body).getPropertyValue("--radius"));