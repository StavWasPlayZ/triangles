const geometryTypes = [
    {
        name: "equality",
        supports: ".lineo",
        participants: 2,
        require_points: true,
        init_on_point_drag: true,

        /** @param {GeometryObject} geometryObj */
        function: (geometryObj, point) => {
            const elements = geometryObj.participants;


            const currentElement = point.parentElement.parentElement,
            shape1 = currentElement.firstChild

            const secondElement = ((currentElement == elements[0]) ? elements[1] : elements[0]),
                shape2 = secondElement.firstChild;
                // secondElement.children[1] = point container
            let leftPoint = secondElement.children[1].children[0],
                rightPoint = secondElement.children[1].children[1];
            const getOpposite = (_point) => (_point == leftPoint) ? rightPoint : leftPoint


            let pointToMove = point.classList.contains("right") ? rightPoint : leftPoint;
            if (shape1.hasAttribute("mirror"))
                pointToMove = getOpposite(pointToMove);
            
            /* Check if pointToMove can even move */ {
                const befPointToMove = pointToMove;
                pointToMove = checkPointToMove(pointToMove, getOpposite(pointToMove), point);

                if (pointToMove == null)
                    return befPointToMove;
                if (pointToMove != befPointToMove) {
                    leftPoint = pointToMove.parentElement.firstChild;
                    rightPoint = leftPoint.nextElementSibling;
                }
            }


            const shape2Rot = getRotation(shape2),
                m = isNaN(shape2Rot) ? 0 : shape2Rot,
                c = parseInt(shape1.style.width),

                a = c * Math.cos(m),
                b = c * Math.sin(m);


            const otherPoint = getOpposite(pointToMove),
                multiplier = ((otherPoint == leftPoint) ? 1 : (-1));
            pointToMove.style.left = otherPoint.offsetLeft + (a * multiplier)+"px";
            pointToMove.style.top = otherPoint.offsetTop + (b * multiplier)+"px";


            const sniplist = sniplists.get(pointToMove);
            if (sniplist != undefined)
                for (let i = 0; i < sniplist.length; i++) {
                    const element = sniplist[i];
                    element.style.left = pointToMove.style.left;
                    element.style.top = pointToMove.style.top;
                    dragLine(element);
                }
            

            dragLine(pointToMove);
            return pointToMove;
        },

        color_function: (pickedElements) => {
            let firstColor = null, otherColor = null;
            for (let i = 0; i < pickedElements.length; i++) {
                const element = pickedElements[i], shapeColor = element.style.getPropertyValue("--shape-color");
                if (firstColor == null)
                    firstColor = shapeColor;
                else if (shapeColor != firstColor) {
                    otherColor = shapeColor;
                    break;
                }
            }

            const sharedColor = (otherColor === null) ? ("#"+(Math.floor(Math.random()*15777215)+1000000).toString(16)) : (otherColor ? otherColor : firstColor);
            for (let i = 0; i < pickedElements.length; i++)
                pickedElements[i].style.setProperty("--shape-color", sharedColor);
        }
    }
]

/**
 * @param {HTMLElement} point 
 * @param {HTMLElement} currPoint 
 * @returns True wether {@link point} is either being snipped or is snipped to {@link currPoint this point}'s sibling, false otherwise
 */
function isSnipped(point, currPoint) {
    if (point.hasAttribute("snip"))
        return true;

    const sniplist = sniplists.get(point);
    if (sniplist == undefined)
        return false;
    

    for (let i = 0; i < sniplist.length; i++)
        if (getFirstSibling(currPoint) == sniplist[i])
            return true;
    
    return false;
}

/**
 * Checks if {@link pointToMove} is a valid subject to be moved by {@link currentPoint}.
 * Replaces it if needed and is possible.
 * 
 * @param {HTMLElement} perferredPoint The first point of the checked shape; the perferred one
 * @param {HTMLElement} otherPoint The second point of the checked shape
 * @param {HTMLElement} currentPoint ...the current point
 * 
 * @returns {HTMLElement?} Either the same given point, a different one, or null if no matches
 */
function checkPointToMove(perferredPoint, otherPoint, currentPoint, checkInner = true) {

    // Check if the perferred point is snipped
    if (isSnipped(perferredPoint, currentPoint)) {
        // If so, refer to the sibling and perform the same check
        if (isSnipped(otherPoint, currentPoint)) {

            //FIXME: This is the cause for a lot of problems, AKA experimantal. Very necessary, though.

            // Check if either point has a 'snip' attribute, and attempt to perform the same check on them
            if (checkInner) {
                const SC1 = innerSnipCheck(perferredPoint, currentPoint); // SC = Snip Check
                if (SC1 != null)
                    return SC1;
                const SC2 = innerSnipCheck(otherPoint, currentPoint);
                if (SC2 != null)
                    return SC2;
            }


            // All above points are no match
            return null;
        }

        return otherPoint;
    }

    return perferredPoint;
    
}
/**
 * Checks if {@link point} is snipped.
 * On the case that it is, checks whether the snipped point is a valid subject to be moved by {@link currentPoint} using {@link checkPointToMove};
 * Null otherwise
 * @param {HTMLElement} point The point to check for
 * @param {HTMLElement} currentPoint
 */
function innerSnipCheck(point, currentPoint) {
    if (!point.hasAttribute("snip"))
        return null;


    const oPerferredPoint = points[point.getAttribute("snip")],
        oOtherPoint = getFirstSibling(oPerferredPoint);

    return checkPointToMove(oPerferredPoint, oOtherPoint, currentPoint, false);
}