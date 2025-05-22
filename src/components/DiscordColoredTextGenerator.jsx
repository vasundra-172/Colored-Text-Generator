import React, { useState, useRef, useEffect } from 'react';
import { Button, Tooltip, Group, Title, Text, Flex, Stack, Anchor } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import '@mantine/core/styles.css';
import './ANSIColors.css'; // For custom styles

const DiscordColoredTextGenerator = () => {
  const textareaRef = useRef(null);
  const { copy } = useClipboard();
  const [copyCount, setCopyCount] = useState(0);
  const [copyMessage, setCopyMessage] = useState('Copy text as Discord formatted');
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef(null); 

  // Color definitions (same as in the original code)
  const tooltipTexts = {
    "30": "Dark Gray (33%)",
    "31": "Red",
    "32": "Yellowish Green",
    "33": "Gold",
    "34": "Light Blue",
    "35": "Pink",
    "36": "Teal",
    "37": "White",
    "40": "Blueish Black",
    "41": "Rust Brown",
    "42": "Gray (40%)",
    "43": "Gray (45%)",
    "44": "Light Gray (55%)",
    "45": "Blurple",
    "46": "Light Gray (60%)",
    "47": "Cream White",
  };

  const colorStyles = {
    "30": "#555555",
    "31": "#FF5555",
    "32": "#55FF55",
    "33": "#FFAA00",
    "34": "#55AAFF",
    "35": "#FF55FF",
    "36": "#55FFFF",
    "37": "#FFFFFF",
    "40": "#2F3136",
    "41": "#8B4513",
    "42": "#666666",
    "43": "#737373",
    "44": "#8C8C8C",
    "45": "#7289DA",
    "46": "#999999",
    "47": "#F5F5DC",
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.innerHTML = 'Welcome to Rebane\'s Discord Colored Text Generator!';
    }
  }, []);

  const applyStyle = (ansiCode) => {
    const textarea = textareaRef.current;
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || !textarea.contains(selection.anchorNode)) return;

    const text = selection.toString();
    if (!text) return;

    const span = document.createElement('span');
    span.innerText = text;
    span.classList.add(`ansi-${ansiCode}`);

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);

    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const applyBold = () => {
    const textarea = textareaRef.current;
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || !textarea.contains(selection.anchorNode)) return;

    const text = selection.toString();
    if (!text) return;

    const span = document.createElement('span');
    span.innerText = text;
    span.style.fontWeight = 'bold';
    span.classList.add('bold-text'); 

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);

    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const applyUnderline = () => {
    const textarea = textareaRef.current;
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || !textarea.contains(selection.anchorNode)) return;

    const text = selection.toString();
    if (!text) return;

    const span = document.createElement('span');
    span.innerText = text;
    span.style.textDecoration = 'underline';
    span.classList.add('underline-text');

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);

    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const nodesToANSI = (nodes, states) => {
    let text = '';
    for (const node of nodes) {
      if (node.nodeType === 3) {
        text += node.textContent;
        continue;
      }
      if (node.nodeName === 'BR') {
        text += '\n';
        continue;
      }
      const ansiCode = +(node.className.split('-')[1]);
      const newState = { ...states[states.length - 1] };

      if (ansiCode < 30) newState.st = ansiCode;
      if (ansiCode >= 30 && ansiCode < 40) newState.fg = ansiCode;
      if (ansiCode >= 40) newState.bg = ansiCode;

      states.push(newState);
      text += `\x1b[${newState.st};${ansiCode >= 40 ? newState.bg : newState.fg}m`;
      text += nodesToANSI(node.childNodes, states);
      states.pop();
      text += `\x1b[0m`;
      if (states[states.length - 1].fg !== 2) text += `\x1b[${states[states.length - 1].st};${states[states.length - 1].fg}m`;
      if (states[states.length - 1].bg !== 2) text += `\x1b[${states[states.length - 1].st};${states[states.length - 1].bg}m`;
    }
    return text;
  };

  const handleCopy = () => {
    const toCopy = "```ansi\n" + nodesToANSI(textareaRef.current.childNodes, [{ fg: 2, bg: 2, st: 2 }]) + "\n```";
    copy(toCopy);

    const funnyCopyMessages = [
      "Copied!", "Double Copy!", "Triple Copy!", "Dominating!!", "Rampage!!",
      "Mega Copy!!", "Unstoppable!!", "Wicked Sick!!", "Monster Copy!!!", "GODLIKE!!!",
      "BEYOND GODLIKE!!!!", "CRAZY COPY!"
    ];

    setCopyCount((prev) => Math.min(11, prev + 1));
    const newMessage = funnyCopyMessages[Math.min(copyCount, 11)];
    setCopyMessage(newMessage);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current.id);
    }

    // Set a timeout to reset the button, but only if not hovering
    const startTime = Date.now();
    timeoutRef.current = {
      id: setTimeout(() => {
        if (!isHovering) {
          setCopyCount(0);
          setCopyMessage('Copy text as Discord formatted');
        }
      }, 2000),
      startTime,
    };
  };

  const handleMouseLeave = () => {
    setIsHovering(false);

    // If the timeout has been set and 2 seconds have passed, reset the button
    if (timeoutRef.current && copyCount > 0) {
      const elapsedTime = Date.now() - timeoutRef.current.startTime;
      const remainingTime = 2000 - elapsedTime;
      if (remainingTime <= 0) {
        setCopyCount(0);
        setCopyMessage('Copy text as Discord formatted');
      } else {
        // If the 2 seconds haven't passed, set a new timeout for the remaining time
        timeoutRef.current.id = setTimeout(() => {
          setCopyCount(0);
          setCopyMessage('Copy text as Discord formatted');
        }, remainingTime);
      }
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const resetAll = () => {
    if (textareaRef.current) {
      textareaRef.current.innerHTML = 'Welcome to Discord Colored Text Generator!';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#36393F',
        minHeight: '100vh',
        color: '#FFFFFF',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <Title order={1} align="center" mb="md" style={{ color: '#fff' }}>
       Discord <Title order={1} component="span" c="#5865F2">Colored</Title> Text Generator
      </Title>
      <Text size="xl" fw={700} mb="md">About</Text>
      <Text mb="md">
        This is a simple app that creates colored Discord messages using the <br /> ANSI color codes available on the latest Discord desktop versions. <br /><br />
        To use this, write your text, select parts of it and assign colors to them,<br /> then copy it using the button below, and send in a Discord message.
      </Text>
      {/* <Text size="xl" fw={700} mb="md">Source Code</Text> */}
      <Text mb="md">
        {/* This app runs entirely in your browser and the source code is freely <br /> available    
        on <Anchor href="https://gist.github.com/rebane2001/07f2d8e80df053c70a1576d27eabe97c" target="_blank" underline="always">
        Github
      </Anchor>. */}
       Shout out to kkrypt0nn for <Anchor href="https://gist.github.com/kkrypt0nn/a02506f3712ff2d1c8ca7c9e0aed7c06" target="_blank" underline="always">this guide.</Anchor>
      </Text>

      <Title order={2} align="center" mb="md">
        Create your text
      </Title>

      <Flex mb="md" justify={{ sm: 'center' }} gap="md">
        <Button onClick={resetAll} color="#4f545c">
          Reset All
        </Button>
        <Button onClick={applyBold} color="#4f545c">Bold</Button>
        <Button onClick={applyUnderline} color="#4f545c">Line</Button>
      </Flex>

      <Stack align="center" mb="md">
        <div>
          <Group justify="center">
          <Text mb="xs">FG</Text>
            {Object.keys(tooltipTexts).slice(0, 8).map((code) => (
              <Tooltip key={code} label={tooltipTexts[code]} position="top">
                <Button
                  onClick={() => applyStyle(code)}
                  style={{ backgroundColor: colorStyles[code], width: '50px', height: '40px' }}
                />
              </Tooltip>
            ))}
          </Group>
        </div>

        <div>
          <Group justify="center">
          <Text mb="xs">BG</Text>
            {Object.keys(tooltipTexts).slice(8).map((code) => (
              <Tooltip key={code} label={tooltipTexts[code]} position="top">
                <Button
                  onClick={() => applyStyle(code)}
                  style={{ backgroundColor: colorStyles[code], width: '50px', height: '40px' }}
                />
              </Tooltip>
            ))}
          </Group>
        </div>
      </Stack>

      <div
        ref={textareaRef}
        contentEditable
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          margin: '20px 400px',
          minHeight: '100px',
          backgroundColor: '#2f3136',
          color: '#fff',
          borderRadius: '4px',
        }}
      />

      <Button
        onClick={handleCopy}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        color={copyCount === 0 ? undefined : copyCount <= 8 ? 'green' : 'red'}
        style={{
          backgroundColor: copyCount === 0 ? '#4f545c' : undefined,
        }}
      >
        {copyMessage}
      </Button>

      <Text align="center" mt="md" size="sm" color="dimmed">
        This is an unofficial tool, it is not made or endorsed by Discord.
      </Text>
    </div>
  );
};

export default DiscordColoredTextGenerator;