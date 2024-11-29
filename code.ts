// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 300 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

// Figma Plugin Code
figma.showUI(__html__, { width: 400, height: 300 });

const NAMECOLUMN = 'name';
const PRONOUNCOLUMN = 'Pronouns';
const STATUSCOLUMN = 'approval_status';

figma.ui.onmessage = async (msg) => {
  await figma.loadFontAsync({ family: "SF Mono", style: "Regular" })
  await figma.loadFontAsync({ family: "SF Mono", style: "Bold" })
  await figma.loadFontAsync({ family: "SF Pro Display", style: "Bold" })
  await figma.loadFontAsync({ family: "SF Pro Display", style: "Regular" })

  if (msg.type === 'csv-upload') {
    const csvData = msg.data;

    if (figma.currentPage.selection.length === 0) {
      figma.closePlugin('Please select a layer.');
      return;
    }

    let selectedLayer = figma.currentPage.selection[0];

    const rows = csvData.split('\n');
    const headers = rows[0].split(',');

    const nameIndex = headers.indexOf(NAMECOLUMN);
    if (nameIndex === -1) {
      figma.closePlugin(`Column "${NAMECOLUMN}" not found in CSV file.`);
      return;
    }

    const pronounIndex = headers.indexOf(PRONOUNCOLUMN);
    if (pronounIndex === -1) {
      figma.closePlugin(`Column "${PRONOUNCOLUMN}" not found in CSV file.`);
      return;
    }

    const statusIndex = headers.indexOf(STATUSCOLUMN);
    if (statusIndex === -1) {
      figma.closePlugin(`Column "${STATUSCOLUMN}" not found in CSV file.`);
      return;
    }

    let names = rows.slice(1).map((row: { split: (arg0: string) => { (): any; new(): any;[x: string]: any; }; }) => row.split(',')[nameIndex]);
    let pronouns = rows.slice(1).map((row: { split: (arg0: string) => { (): any; new(): any;[x: string]: any; }; }) => row.split(',')[pronounIndex]);
    const statuses = rows.slice(1).map((row: { split: (arg0: string) => { (): any; new(): any;[x: string]: any; }; }) => row.split(',')[statusIndex]);

    // filter out statuses that are not approved from names and pronouns
    const approvedNames = [];
    const approvedPronouns = [];
    for (let i = 0; i < statuses.length; i++) {
      if (statuses[i] === 'approved') {
        approvedNames.push(names[i]);
        approvedPronouns.push(pronouns[i]);
      }
    }

    names = approvedNames;
    pronouns = approvedPronouns;

    /*
    const VERTICAL_GAP = 9;
    const HORIZONTAL_GAP = 75.5;
    const PAGE_GAP = (109/2) - 12 + 40.5;
    const PER_COL = 10;
    */

    const VERTICAL_GAP = 0;
    const HORIZONTAL_GAP = 45 - 46;
    const PAGE_GAP = 0;
    const PER_COL = 7;

    // random number counter

    let rand = 1;
    let frameIndex = 1;
    let counter = 1;
    for (let i = 0; i < 8; i++) {

      const newLayer = figma.currentPage.findOne(node => node.name === 'Frame-base-' + frameIndex)?.clone() as GroupNode;
      newLayer.name = names[i];

      const textLayers = newLayer.findAll(node => node.type === 'TEXT') as TextNode[];
      if (textLayers.length > 0) {
        textLayers[1].characters = names[i].replaceAll("\"", "");
        //textLayers[1].characters = ""
        textLayers[0].characters = pronouns[i].replaceAll("\"", "");
        //textLayers[0].characters = ""
      }

      
      const randomNumber = Math.floor(Math.random() * 4) + 1;
      console.log(randomNumber);
      const placeholderLayer = newLayer.findOne(node => node.name === 'Placeholder');
      const letterLayer = figma.currentPage.findOne(node => node.name === randomNumber.toString());
      if (placeholderLayer && letterLayer) {
        const letterLayerClone = letterLayer.clone();
        letterLayerClone.x = placeholderLayer.x;
        letterLayerClone.y = placeholderLayer.y;
        newLayer.appendChild(letterLayerClone);
        placeholderLayer.remove();
      }
      

      let frame = figma.currentPage.findOne(node => node.name === 'Frame-' + frameIndex) as FrameNode;
      //figma.currentPage.appendChild(newLayer);
      frame.appendChild(newLayer);

      // Calculate the position for each name tag
      const column = Math.floor((counter - 1) / 7);
      newLayer.x = selectedLayer.x + column * (selectedLayer.width + HORIZONTAL_GAP);
      newLayer.y = selectedLayer.y + (i % PER_COL) * (selectedLayer.height + VERTICAL_GAP);

      

      if (rand == 7) rand = 0;
      rand++;

      counter++;

      if (counter === 15) {
        counter = 1;
        frameIndex++;
        selectedLayer = figma.currentPage.findOne(node => node.name === 'Frame-base-' + frameIndex) as GroupNode;
        console.log('Frame-base-' + frameIndex);
      }

      console.log('Frame-' + frameIndex);
    }

    //figma.closePlugin('Name tags generated.');
  }
};
