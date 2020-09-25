import React, { useCallback, useMemo, useState } from 'react'
import { Button, Row, Card } from 'react-bootstrap';
import isHotkey from 'is-hotkey'
import { Editable, withReact, useSlate, Slate } from 'slate-react'
import { Editor, Transforms, createEditor, Node } from 'slate'
import { withHistory } from 'slate-history'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { 
    faBold,
    faItalic,
    faUnderline,
    faCode,
    faHeading,
    faQuoteRight,
    faListOl,
    faListUl,
    faVideo,
    faMicrophone
} from '@fortawesome/free-solid-svg-icons';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'enter': 'enter'
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']

const MessageEditor = (props) => {
    const [value, setValue] = useState([
    {
        type: 'paragraph',
        children: [{ text: '' }],
    },
    ])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])


  console.log("THREAD NAME", props.threadName);

  return (
      <Card className="mb-2 mx-2" style={{border:"1px solid rgba(0,0,0,.35)"}}>
          <Card.Body className="pb-0">
            <Slate editor={editor} value={value} onChange={value => setValue(value)}>
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={typeof props.threadName != "undefined" ? `Message ${props.threadName}`: 'Start a new message'}
                    spellCheck
                    autoFocus
                    style={{maxHeight:200,overflowY: "scroll"}}
                    onKeyDown={event => {
                    for (const hotkey in HOTKEYS) {
                        if (isHotkey(hotkey, event)) {
                            event.preventDefault()

                            if (hotkey == "enter") {
                                return props.handleSendMessage(value);
                            }

                            const mark = HOTKEYS[hotkey]
                            toggleMark(editor, mark)
                        }
                    }
                    }}
                />
                <Row style={{backgroundColor:"rgba(0,0,0,.03)"}}>
                    <MarkButton format="bold" icon={faBold} />
                    <MarkButton format="italic" icon={faItalic} />
                    <MarkButton format="underline" icon={faUnderline} />
                    <BlockButton format="numbered-list" icon={faListOl} />
                    <BlockButton format="bulleted-list" icon={faListUl} />
                    <Button variant="primary" className="m-1 ml-auto" onClick={() => props.handleMicrophoneClick()}>
                        <FontAwesomeIcon icon={faMicrophone} />
                    </Button>
                    <Button variant="primary" className="m-1" onClick={() => props.handleVideoClick()}>
                        <FontAwesomeIcon icon={faVideo} />
                    </Button>
                </Row>
            </Slate>
        </Card.Body>
    </Card>
  )
}

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format)
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  })

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  })

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  })

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      variant="light"
      className="m-1"
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <FontAwesomeIcon icon={icon} />
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      variant="light"
      className="m-1"
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <FontAwesomeIcon icon={icon} />
    </Button>
  )
}

export default MessageEditor