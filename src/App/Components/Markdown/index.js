import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useProvided } from 'nonaction';
import { TextContainer } from '../../Container';
import Previewer from './Previewer';
import Editor from './Editor';
import DragBar from './DragBar.js';
import 'github-markdown-css';
import useDrop from '../../Container/Hooks/useDrop.js';
import uploadFile from '../../Lib/uploadFile.js';

import axios from "axios"
import _ from "lodash"

const Markdown = ({ className }) => {
  const [active, SetActive] = useState(null);
  const [loading, SetLoading] = useState("");
  const [items, setItems] = useState([]);
  const [text, setText] = useProvided(TextContainer);
  const [isDrag, setDrag] = useState(false);
  const [startX, setStartX] = useState(0);
  const [width, setWidth] = useState(window.innerWidth / 2);
  const markdownRef = useRef(null);
  const [uploading, isOver] = useDrop(markdownRef, uploadFile);
  // Partial fileText & text

  const fetch = () => {
    SetLoading(".......")
    axios.get("http://localhost:7000/post/getAll").then((a) => {
      console.log("a", a)
      a = _.get(a, "data");
      console.log("a", a)
      const listItems = _.map(a, (it, index) => {
        return <tr key={it.id} onClick={() => { setText(it.markdown); SetActive(index) }}>
          <td>{index}</td>
          <td>{it.date}</td>
          <td>{it.name}</td>
          <td>{_.get(it, "articleType")}</td>
          <td onClick={() => { window.open(it.link) }}>Link</td>
        </tr>
      })
      setItems(listItems)
      SetLoading("")
    })
  }

  const fetch2 = async () => {
    SetLoading(".......")
    const a = await axios.get("https://raw.githubusercontent.com/lamnt95/cryptocoindb/main/main/research.json")
    const b = _.get(a, "data")
    const c = _.map(b, (it) => {
      it.updateDate = new Date(it.date * 1000);
      const month = it.updateDate.getMonth() + 1;
      const year = it.updateDate.getFullYear();
      it.updateDateStr = it.updateDate.getDate() + "-" + month + "-" + year;
      return it;
    })
    const d = _.sortBy(c, ["updateDate"])
    const e = _.reverse(d)
    console.log("e", e)
    const listItems = _.map(e, (it, index) => {
      return <tr key={it.id} onClick={() => { setText(it.markdown); SetActive(index) }}>
        <td>{index}</td>
        <td>{it.updateDateStr}</td>
        <td>{it.name}</td>
        <td>{_.get(it, "articleType")}</td>
        <td onClick={() => { window.open(it.link) }}>Link</td>
      </tr>
    })
    setItems(listItems)
    SetLoading("")
  }

  useEffect(() => {
    const handleMouseUp = () => setDrag(false);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  // The state `isDrag` must be false, when mouse up!
  // So we listen it in window! (Seems ugly, but it just works ha.)

  useEffect(() => {
    // Update the document title using the browser API
    console.log("Component did mount")
    fetch2()
  }, [1]);

  return (
    <div
      ref={markdownRef}
      style={{ opacity: isOver || uploading ? 0.5 : 1 }}
      className={className}
      onMouseMove={e => {
        if (!isDrag) return;
        const pageX = e.nativeEvent.pageX;
        setWidth(pageX - startX);
      }}
    >
      {/* <button onClick={fetch2} >
        Load {loading}
      </button> */}

      <div id="customersWrap">
        <table id="customers">
          <thead className="fixedmenu">
            <tr>
              <th>{active}</th>
            </tr>
          </thead>
          <tbody className="tbody2">
            {items}
          </tbody>
        </table>
      </div>




      {/* <Editor className="no-print" width={width} setText={setText} /> */}
      <DragBar
        className="no-print"
        isDrag={isDrag}
        setDrag={setDrag}
        setStartX={setStartX}
      />
      <Previewer>{text}</Previewer>
    </div>
  );
};

export default styled(Markdown)`
  * {
    box-sizing: border-box;
  }
  height: calc(100% - 40px);
  display: flex;
`;
