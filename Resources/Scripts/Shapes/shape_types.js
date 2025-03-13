let point_num = 0;
const snip_radius = 25;
const button_shapes = [
    {
        shape: "line",

        points: [
            {
                base: true,
                functions: [
                    {
                        event_name: "pointerdown",
                        function: (event, element) => {
                            setDrag(event, element, element.parentNode.parentNode.firstChild.offsetLeft);
                        }
                    },
                    {
                        event_name: "pointermove",
                        // Means that the function is relative to the canvas.
                        apply_on_canvas: true,
                        function: (event, element) => {
                            if (!element.hasAttribute("drag"))
                                return;
                            
                            snipDrag(event, element, true);
                            snip(event, element);

                            dragLine(element);
                        }
                    },
                    {
                        event_name: "pointerup",
                        apply_on_canvas: true,
                        function: (event, element) => {
                            snipUp(element, (_element) => dragLine(_element));
                            element.removeAttribute("drag");
                        }
                    }
                ]
            },
            {
                class: "left",
                style: "left: %rwpx; top: %rhpx;"
            },
            {
                class: "right",
                offset_left: 100
            }
        ],
        attach_pos: "left",
        offset: {
            left: 10,
            top: 5
        },
        functions: [
            {
                event_name: "pointerdown",
                function: (event, element) => {
                    shapeDragBegin(event, element, element.nextElementSibling);
                }
            },
            {
                event_name: "pointermove",
                apply_on_canvas: true,
                function: (event, element) => {
                    if (!element.hasAttribute("drag"))
                        return;
                    
                    const _drag = element.getAttribute("drag").split(" ");
                    const points = element.nextElementSibling;
                    if (!snipDetachment(event, element, _drag, points))
                        shapeDrag(event, element, _drag, points);
                }
            },
            {
                event_name: "pointerup",
                apply_on_canvas: true,
                function: (event, element) => {
                    element.removeAttribute("drag");
                    element.removeAttribute("leftM");
                }
            }
        ],
        allow_width_text: true,
        enable_width_rotation: true
    },
    {
        shape: "point",
        style: "left: %rwpx; top: %rhpx;",
        functions: [
            {
                event_name: "pointerdown",
                function: (event, element) => {
                    setDrag(event, element);
                }
            },
            {
                event_name: "pointermove",
                apply_on_canvas: true,
                function: (event, element) => {
                    if (element.hasAttribute("drag"))
                        drag(event, element);
                }
            },
            {
                event_name: "pointerup",
                apply_on_canvas: true,
                function: (event, element) => {
                    element.removeAttribute("drag");
                }
            }
        ]
    },
    {
        shape: "circle",

        // element_func: () => {
        //     const element = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        //     element.style.setProperty("--circumference", Math.PI * getDefRadius() * 2 + "px");
        //     element.setAttribute("r", getDefRadius()+"px");

        //     return element;
        // },
        // parent_container: (element) => degreeRenderer.appendChild(element),

        // get_left: (element) => parseInt(element.getAttribute("cx")) + getDefRadius() + "px",
        // set_left: (element, value) => element.setAttribute("cx", parseInt(value) + getDefRadius() + "px"),
        // get_top: (element) => parseInt(element.getAttribute("cy")) + getDefRadius()/2 + "px",
        // set_top: (element, value) => element.setAttribute("cy", parseInt(value) + getDefRadius()/2 + "px"),

        points: [
            {
                base: true,
                functions: [
                    {
                        event_name: "pointerdown",
                        function: (event, element) => {
                            setDrag(event, element);
                        }
                    },
                    {
                        event_name: "pointermove",
                        apply_on_canvas: true,
                        function: (event, element) => {
                            if (!element.hasAttribute("drag"))
                                return;
                            
                            snipDrag(event, element, true);
                            const circle = element.parentNode.parentNode.firstChild;
                            

                            const sibling = (element.previousElementSibling == null) ? element.nextElementSibling : element.previousElementSibling,
                                a = element.offsetTop - sibling.offsetTop,
                                b = element.offsetLeft - sibling.offsetLeft;
                        
                            const newDiameter = (Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)) - 5) * 2;
                            circle.style.width = circle.style.height = newDiameter+"px";


                            const midpoint = element.classList.contains("middle") ? element : sibling;
                            circle.style.left = midpoint.offsetLeft - newDiameter/2 + "px";
                            circle.style.top = midpoint.offsetTop - newDiameter/2 + "px";

                            // circle.style.transformOrigin = (midpoint[0] + 10)+"px "+(midpoint[1] + 10)+"px";
                            // set2PointRot(circle, a, b, !element.classList.contains("left"));
                            

                            // const rotationValue = set2PointRot(circle, a, b, isLeft);
                            // console.log((180/rotationValue));
                            //     newPoint[0] +" "+
                            //     parseInt(newPoint[1])+"px";

                            snipDrag(event, element, false)
                            snip(event, element);
                        }
                    },
                    {
                        event_name: "pointerup",
                        apply_on_canvas: true,
                        function: (event, element) => {
                            snipUp(element);
                            element.removeAttribute("drag");
                        }
                    }
                ]
            },

            {
                class: "left",
                style: "left: %rwpx; top: %rhpx;"
            },
            {
                class: "middle",
                // Assuming radius is 30
                offset_left: 30 + 5
            }
        ],
        attach_pos: "left",
        offset: {
            left: 5,
            top: -30
        },

        functions: [
            {
                event_name: "pointerdown",
                function: (event, element) => {
                    shapeDragBegin(event, element, element.nextElementSibling);
                }
            },
            {
                event_name: "pointermove",
                apply_on_canvas: true,
                function: (event, element) => {
                    if (!element.hasAttribute("drag"))
                        return;
                    
                    const _drag = element.getAttribute("drag").split(" ");
                    const points = element.nextElementSibling;
                    if (!snipDetachment(event, element, _drag, points))
                        shapeDrag(event, element, _drag, points);
                }
            },
            {
                event_name: "pointerup",
                apply_on_canvas: true,
                function: (event, element) => {
                    element.removeAttribute("drag");
                    element.removeAttribute("leftM");
                }
            }
        ]
    }
]