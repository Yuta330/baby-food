#!/usr/bin/env node
// Minimal chromium-cli-like REPL driver for this Vite/React app, using
// Playwright directly (chromium-cli itself is not installed on this host).
// Reads one command per line from stdin, prints one result line per command.
//
// Commands:
//   nav <path>                          navigate (path is relative to BASE_URL, or a full URL)
//   reload                              reload current page
//   wait-for text=<substring>           wait for text to appear
//   wait-for <css selector>             wait for a selector to appear
//   click <css selector>                click an element (supports Playwright text= / has-text() etc.)
//   click-file-chooser <selector> <path> click a button that opens a native file picker, feed it <path>
//   fill <selector> <value...>          fill an input (value is everything after the selector)
//   text <selector>                     print innerText of the first match
//   options <selector>                  print all innerText of matches as JSON array (e.g. "select option")
//   attr <selector> <name>              print an attribute's value (null if absent)
//   set-local-storage <key> <json...>   localStorage.setItem(key, json) in the page
//   get-local-storage <key>             print localStorage.getItem(key)
//   screenshot [name]                   save PNG to ./screenshots/<name> (default: shot-<timestamp>.png)
//   quit                                close the browser and exit
//
// Console errors, page errors, and JS dialogs (auto-accepted) are logged as
// they occur, prefixed [console-error] / [page-error] / [dialog].

import { chromium } from 'playwright';
import readline from 'node:readline';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173/baby-food/';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('[console-error]', msg.text());
});
page.on('pageerror', (err) => console.log('[page-error]', err.message));
page.on('dialog', async (d) => {
  console.log('[dialog]', d.message());
  await d.accept();
});

function resolveUrl(target) {
  return /^https?:\/\//.test(target) ? target : BASE_URL + target.replace(/^\//, '');
}

const rl = readline.createInterface({ input: process.stdin });
for await (const line of rl) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [cmd, ...rest] = trimmed.split(' ');
  try {
    switch (cmd) {
      case 'nav': {
        const url = resolveUrl(rest[0]);
        await page.goto(url);
        console.log('OK nav', url);
        break;
      }
      case 'reload': {
        await page.reload();
        console.log('OK reload');
        break;
      }
      case 'wait-for': {
        const arg = rest.join(' ');
        if (arg.startsWith('text=')) await page.waitForSelector(`text=${arg.slice(5)}`);
        else await page.waitForSelector(arg);
        console.log('OK wait-for', arg);
        break;
      }
      case 'click': {
        const sel = rest.join(' ');
        await page.click(sel);
        console.log('OK click', sel);
        break;
      }
      case 'click-file-chooser': {
        const [sel, filePath] = rest;
        const [chooser] = await Promise.all([
          page.waitForEvent('filechooser'),
          page.click(sel),
        ]);
        await chooser.setFiles(filePath);
        console.log('OK click-file-chooser', sel, filePath);
        break;
      }
      case 'fill': {
        const sel = rest[0];
        const value = rest.slice(1).join(' ');
        await page.fill(sel, value);
        console.log('OK fill', sel, value);
        break;
      }
      case 'select': {
        const sel = rest[0];
        const label = rest.slice(1).join(' ');
        await page.selectOption(sel, { label });
        console.log('OK select', sel, label);
        break;
      }
      case 'text': {
        const sel = rest.join(' ');
        const t = await page.locator(sel).first().innerText();
        console.log('TEXT', JSON.stringify(t));
        break;
      }
      case 'options': {
        const sel = rest.join(' ');
        const opts = await page.locator(sel).allInnerTexts();
        console.log('OPTIONS', JSON.stringify(opts));
        break;
      }
      case 'attr': {
        // last token is the attribute name; everything before it is the
        // selector (selectors may contain spaces, e.g. descendant combinators)
        const name = rest[rest.length - 1];
        const sel = rest.slice(0, -1).join(' ');
        const v = await page.locator(sel).first().getAttribute(name);
        console.log('ATTR', JSON.stringify(v));
        break;
      }
      case 'set-local-storage': {
        const [key, ...jsonParts] = rest;
        const value = jsonParts.join(' ');
        await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
        console.log('OK set-local-storage', key);
        break;
      }
      case 'get-local-storage': {
        const key = rest[0];
        const value = await page.evaluate((k) => localStorage.getItem(k), key);
        console.log('LOCAL-STORAGE', value);
        break;
      }
      case 'screenshot': {
        const name = rest[0] || `shot-${Date.now()}.png`;
        const filePath = path.join(SCREENSHOT_DIR, name);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log('OK screenshot', filePath);
        break;
      }
      case 'quit': {
        await browser.close();
        process.exit(0);
      }
      default:
        console.log('ERR unknown-command', cmd);
    }
  } catch (e) {
    console.log('ERR', cmd, e.message.split('\n')[0]);
  }
}
await browser.close();
