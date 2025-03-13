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
                leftPoint = secondElement.children[1].children[0],
                rightPoint = secondElement.children[1].children[1];
            const getOpposite = (_point) => (_point == leftPoint) ? rightPoint : leftPoint


            let pointToMove = point.classList.contains("right") ? rightPoint : leftPoint;
            if (shape1.hasAttribute("mirror"))
                pointToMove = getOpposite(pointToMove);
            // First snip check
            if (isSnipped(pointToMove, point))
                // Second snip check, after switching to pointToMove's sibling
                if (isSnipped(pointToMove = getOpposite(pointToMove), point))
                    // We don't have much to do if the point is snipped on both sides
                    //TODO: the above is a lie. Add a check for if the snipped element can be 'pointToMove', for both points.
                    return pointToMove;


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