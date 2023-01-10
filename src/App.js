import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import Axios from "axios";

const imagenUrl = "https://jsonplaceholder.typicode.com/photos";

/**
 * 
 * @returns Renderea la aplicación principal
 */
const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [list, setList] = useState([]);

  /**
   * Obtener la lista de imágenes
   */
  useEffect(() => {
    Axios({
      url: imagenUrl,
    })
      .then((response) => {
        setList(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [setList]);

  /**
   * Añade un nuevo element moveable al array de componentes
   */
  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      },
    ]);
  };

  /**
   * 
   * @param {*} id 
   * @param {*} newComponent 
   * @param {*} updateEnd 
   * Actualiza el componente que contenga el id
   */
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const fit = ['fill', 'cover', 'contain', 'none', 'scale-down']; 

  /**
   * Remueve el ultimo elemento de la lista de componentes
   */
  const removeMoveable = () => {
    setMoveableComponents(() => {
      moveableComponents.pop();
      return [...moveableComponents];
    });
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button onClick={removeMoveable}>Remove Moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            setSelected={setSelected}
            isSelected={selected === item.id}
            imageUrl={list[index].url}
            fit={fit[index]}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

/**
 * Renderizar un componente dentro del parent
 * @param {*} param0 
 * @returns 
 */
const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  imageUrl,
  fit
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  /**
   * Actualizar las dimenciones del componente selecionado
   * @param {*} e 
   */
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height
        }}
        
        onClick={() => setSelected(id)}
      >
        <img src={imageUrl} alt={imageUrl} style={{ objectFit: fit }} />
      </div>

      <Moveable
        target={isSelected && ref.current}
        snappable={true}
        bounds={{
          left: parentBounds.left - parentBounds.x,
          top: parentBounds.top - parentBounds.y,
          right: parentBounds.right - parentBounds.x,
          bottom: parentBounds.bottom - parentBounds.y
        }}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        warpable={true}
      />
    </>
  );
};
