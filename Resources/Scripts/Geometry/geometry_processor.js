const geometrySidebar = document.getElementById("geometrydefiner"), hintBox = document.getElementById("line-hint");
const documentElement = document.documentElement, bodyStyle = document.body.style, backgroundColor = bodyStyle.backgroundColor;

let currentGeometryObject = undefined;
geometrySidebar.querySelectorAll("button").forEach((geoBtn) => {
    geoBtn.addEventListener("click", () => {
        hintBox.classList.add("show");
        bodyStyle.backgroundColor = "rgb(18, 17, 21)";
    });

    for (let i = 0; i < geometryTypes.length; i++) {
        const entry = geometryTypes[i];
        
        if (geoBtn.id === entry.name) {
            geoBtn.addEventListener("click", () => {
                currentGeometryObject = entry;
                
                canvas.querySelectorAll(entry.supports).forEach((element) => {
                    element.classList.add("hilight");
                    element.addEventListener("click", pick);

                    documentElement.classList.add("picking");
                });

            });
            break;
        }
        
    }
});
function closeHintBox(destroyOptionals = true) {
    if (!hintBox.classList.contains("show"))
        return;


    hintBox.classList.remove("show");
    bodyStyle.backgroundColor = backgroundColor;

    canvas.querySelectorAll(".hilight").forEach((element) => {
        element.classList.remove("hilight");
        element.removeEventListener("click", pick);
    });
    canvas.querySelectorAll(".picked").forEach((element) => {
        element.classList.remove("picked");
    });

    documentElement.classList.remove("picking");
    documentElement.style.setProperty("--shape-color", "white");


    selectionCount = 0;
    if (destroyOptionals)
        destroyOptional();
}
function destroyOptional() {
    currentGeometryObject = undefined;
    pickedElements = [];
}
hintBox.querySelector("div").addEventListener("click", closeHintBox);


let selectionCount = 0;
let pickedElements = [];

function pick(event) {
    const element = event.target, container = element.classList.contains("genobj") ? element : element.parentElement;
    if (container.classList.contains("picked")) {
        container.classList.remove("picked");
        pickedElements.splice(pickedElements.indexOf(container));
        selectionCount--;
    } else {
        container.classList.add("picked");
        pickedElements.push(container);
        selectionCount++;
    }

    if (selectionCount == currentGeometryObject.participants)
        submitGeometry();
}

/**
 * @param {Array} arr1 
 * @param {Array} arr2 
 * @returns {boolean} whether {@link arr1} the same as {@link arr2}
 */
function isSimilar(arr1, arr2) {
    if (arr1.length != arr2.length)
        return false;
    
    
    for (let i = 0; i < arr1.length; i++)
        if (!arr2.includes(arr1[i]))
            return false;
            
    return true;
}
function submitGeometry() {
    const geoName = currentGeometryObject.name;

    // Get the current array for the selected geometry method;
    // Create one if unpresent
    if (!geometryFunctions.has(geoName))
        geometryFunctions.set(geoName, []);
    const thisGeoArrs = geometryFunctions.get(geoName);

    // If the chosen elements are already paired in the same method, a stack overflow will accure.
    for (let i = 0; i < thisGeoArrs.length; i++) {
        const elements = thisGeoArrs[i].participants;
        if (isSimilar(pickedElements, elements)) {
            closeHintBox();
            return;
        }
    }


    // If the method only cares about a shape's points, get them
    let points = [];
    if (currentGeometryObject.require_points)
        pickedElements.forEach((element) =>
            element.querySelectorAll(".points>.opoint").forEach((point) => points.push(point))
        );
    
    const initOnPointDrag = currentGeometryObject.init_on_point_drag,
        geometryObj = {
            participants: pickedElements,
            function: currentGeometryObject.function,
            points: points,
            init_on_point_drag: (initOnPointDrag != undefined) && initOnPointDrag
        };
    thisGeoArrs.push(geometryObj)



    currentGeometryObject.function(geometryObj, (initOnPointDrag ? points[0] : null));
    closeHintBox(false);

    currentGeometryObject.color_function(pickedElements);
    destroyOptional();
}




/**
 * @typedef GeometryObject
 * @type {{participants: HTMLElement[], points: HTMLElement[], init_on_point_drag: boolean, function: function}}
*/
/**
* @type {Map<string, GeometryObject[]>}
*/
let geometryFunctions = new Map();
/**
 * @param {(geoFunc: GeometryObject) => null} runnable 
 */
function iterateGeoFuncs(runnable) {
    for (const geoFuncs of geometryFunctions.values())
        for (let i = 0; i < geoFuncs.length; i++)
            runnable(geoFuncs[i]);
}


canvas.addEventListener("pointermove", () => {
    iterateGeoFuncs((geoFunc) => {
        callGeometryFunction(geoFunc, (point) => point.hasAttribute("drag"), () => true);
    
        const sniplist = sniplists.get(point);
        if (sniplist == undefined)
            return;
        
        for (let i = 0; i < sniplist.length - 1; i++) {
            const element = points[sniplist[i]];
            searchAdditionGeometry(element, geoFunc);
        }
    })
});

function searchAdditionGeometry(serachElement, currentItem) {
    iterateGeoFuncs((geoFunc) => {
        if (currentItem == geoFunc)
            return;
    
        const predicate = (element) => element == serachElement;
        callGeometryFunction(geoFunc, predicate, predicate);
    })
}
function callGeometryFunction(geometryObj, pointPredicate, elementPredicate) {
    let foundElement = null;

    if (geometryObj.init_on_point_drag) {
        const points = geometryObj.points;
        for (let i = 0; i < points.length; i++) {
            const point = points[i];

            if (pointPredicate(point)) {
                foundElement = geometryObj.function(geometryObj, point);
                break;
            }
        }
    } else if (elementPredicate())
        foundElement = geometryObj.function(geometryObj);
    

    if (foundElement != null)
        searchAdditionGeometry(foundElement, geometryObj);
}