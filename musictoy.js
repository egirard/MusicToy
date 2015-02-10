/*****************************************************************************
*
*  This file is part of the MusicToy project. The project is
*  distributed at:
*  https://github.com/maximecb/MusicToy
*
*  Copyright (c) 2012, Maxime Chevalier-Boisvert. All rights reserved.
*
*  This software is licensed under the following license (Modified BSD
*  License):
*
*  Redistribution and use in source and binary forms, with or without
*  modification, are permitted provided that the following conditions are
*  met:
*   1. Redistributions of source code must retain the above copyright
*      notice, this list of conditions and the following disclaimer.
*   2. Redistributions in binary form must reproduce the above copyright
*      notice, this list of conditions and the following disclaimer in the
*      documentation and/or other materials provided with the distribution.
*   3. The name of the author may not be used to endorse or promote
*      products derived from this software without specific prior written
*      permission.
*
*  THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED
*  WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
*  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
*  NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
*  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
*  NOT LIMITED TO PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
*  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
*  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
*  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
*****************************************************************************/

function initSynth(synthNet, piece)
{
    // Bass patch
    var bass = synthNet.addNode(new VAnalog(3));
    bass.name = 'bass';

    bass.oscs[0].type = 'pulse';
    bass.oscs[0].duty = 0.5;
    bass.oscs[0].detune = -1195;
    bass.oscs[0].volume = 1;

    bass.oscs[1].type = 'pulse';
    bass.oscs[1].duty = 0.5;
    bass.oscs[1].detune = -1205;
    bass.oscs[1].volume = 1;

    bass.oscs[2].type = 'sawtooth';
    bass.oscs[2].detune = 0;
    bass.oscs[2].volume = 1;

    bass.oscs[0].env.a = 0;
    bass.oscs[0].env.d = 0.3;
    bass.oscs[0].env.s = 0.1;
    bass.oscs[0].env.r = 0.2;

    bass.oscs[1].env = bass.oscs[0].env;
    bass.oscs[2].env = bass.oscs[0].env;

    bass.cutoff = 0.3;
    bass.resonance = 0;

    bass.filterEnv.a = 0;
    bass.filterEnv.d = 0.25;
    bass.filterEnv.s = 0.25;
    bass.filterEnv.r = 0.25;
    bass.filterEnvAmt = 0.85;

    // Lead patch
    var lead = synthNet.addNode(new VAnalog(2));
    lead.name = 'lead';

    lead.oscs[0].type = 'pulse';
    lead.oscs[0].duty = 0.5;
    lead.oscs[0].detune = -1195;
    lead.oscs[0].volume = 1;

    lead.oscs[1].type = 'pulse';
    lead.oscs[1].duty = 0.5;
    lead.oscs[1].detune = -1205;
    lead.oscs[1].volume = 1;

    lead.oscs[0].env.a = 0;
    lead.oscs[0].env.d = 0.1;
    lead.oscs[0].env.s = 0;
    lead.oscs[0].env.r = 0;

    lead.oscs[1].env = lead.oscs[0].env;

    lead.cutoff = 0.3;
    lead.resonance = 0;

    lead.filterEnv.a = 0;
    lead.filterEnv.d = 0.2;
    lead.filterEnv.s = 0;
    lead.filterEnv.r = 0;
    lead.filterEnvAmt = 0.85;

    // Drum kit
    var sampleKit = synthNet.addNode(new SampleKit());
    sampleKit.mapSample('C4', 'samples/drum/biab_trance_kick_4.wav', 2.2);
    sampleKit.mapSample('C#4', 'samples/drum/biab_trance_snare_2.wav', 2);
    sampleKit.mapSample('D4', 'samples/drum/biab_trance_hat_6.wav', 2);
    sampleKit.mapSample('D#4', 'samples/drum/biab_trance_clap_2.wav', 3);

    // Overdrive effect
    var overdrive = synthNet.addNode(new Overdrive());
    overdrive.gain = 8;
    overdrive.factor = 50;

    // Mixer
    var mixer = synthNet.addNode(new Mixer());
    mixer.inVolume[0] = 0.5;
    mixer.inVolume[1] = 0.5;
    mixer.inVolume[2] = 2;
    mixer.outVolume = 0.7;

    // Sound output node
    var outNode = synthNet.addNode(new OutNode(2));

    // Connect all synth nodes and topologically order them
    bass.output.connect(mixer.input0);
    //vanalog.output.connect(overdrive.input);
    //overdrive.output.connect(mixer.input0);
    lead.output.connect(mixer.input1);
    sampleKit.output.connect(mixer.input2);
    mixer.output.connect(outNode.signal);
    synthNet.orderNodes();

    // Create a track for the bass instrument
    var bassTrack = new Track(bass);
    piece.addTrack(bassTrack);

    // Create a track for the lead instrument
    var leadTrack = new Track(lead);
    piece.addTrack(leadTrack);

    // Create a track for the drum kit
    var drumTrack = new Track(sampleKit);
    piece.addTrack(drumTrack);

    piece.beatsPerMin = 137;
    piece.beatsPerBar = 4;
    piece.noteVal = 4;

    piece.loopTime = piece.beatTime(Sequencer.NUM_BEATS);

    var sequencer = new Sequencer(
        piece,
        leadTrack,
        drumTrack,
        'G4',
        'C4',
        'minor pentatonic',
        2,
        4
    );

    function redraw()
    {
        sequencer.draw(canvas, canvasCtx);
    }

    var drawInterv = undefined;

    // Play button
    sequencer.makeButton(
        (canvas.width / 2) - 60 - 20,
        canvas.height - 30,
        60,
        25,
        undefined,
        function click()
        {
            stopAudio();

            if (drawInterv !== undefined)
                clearInterval(drawInterv);
            drawInterv = setInterval(redraw, 100);

            playAudio();
        },
        function draw(ctx)
        {
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = 'white';
            ctx.font = '14pt Arial';
            ctx.fillText('Play', this.x + this.width / 2, this.y);
        }
    );

    // Stop button
    sequencer.makeButton(
        (canvas.width / 2) + 20,
        canvas.height - 30,
        60,
        25,
        undefined,
        function click()
        {
            stopAudio();

            if (drawInterv !== undefined)
                clearInterval(drawInterv);
        },
        function draw(ctx)
        {
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = 'white';
            ctx.font = '14pt Arial';
            ctx.fillText('Stop', this.x + this.width / 2, this.y);
        }
    );

    // Clear button
    sequencer.makeButton(
        (canvas.width) - 80,
        canvas.height - 30,
        60,
        25,
        undefined,
        function click()
        {
            location.hash = '';
            location.reload();
        },
        function draw(ctx)
        {
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgb(255, 0, 0)';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = 'red';
            ctx.font = '14pt Arial';
            ctx.fillText('Clear', this.x + this.width / 2, this.y);
        }
    );

    // Canvas mouse down handler
    function canvasOnClick(event)
    {
        var xPos = event.offsetX;
        var yPos = event.offsetY;

        console.log('canvas click ' + event.button + '(' + xPos + ', ' + yPos + ')');

        sequencer.click(xPos, yPos);

        redraw();
    }

    canvas.addEventListener("click", canvasOnClick, false);

    sequencer.draw(canvas, canvasCtx);

    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    function resize() {
        for (var i = 0; i < sequencer.buttons.length; ++i) {
            sequencer.buttons[i].resize(canvasHeight, canvasWidth);
        }
        sequencer.draw(canvas, canvasCtx);
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
    }
    window.addEventListener('resize', resize, false);
}

/**
@class Sequencer interface
*/
function Sequencer(
    piece,
    leadTrack,
    drumTrack,
    leadRoot,
    drumRoot,
    leadScale,
    numOctaves,
    numDrums
)
{
    if ((leadRoot instanceof Note) === false)
        leadRoot = new Note(leadRoot);

    if ((drumRoot instanceof Note) === false)
        drumRoot = new Note(drumRoot);

    // Generate the lead instrument notes
    var leadNotes = genScale(leadRoot, leadScale, numOctaves);

    // Generate the drum notes
    var drumNotes = [];
    for (var i = 0; i < numDrums; ++i)
        drumNotes.push(drumRoot.offset(i));

    /**
    Piece to render to
    */
    this.piece = piece;

    /**
    Lead track
    */
    this.leadTrack = leadTrack;

    /**
    Drum track
    */
    this.drumTrack = drumTrack;

    /**
    Lead instrument notes
    */
    this.leadNotes = leadNotes;

    /**
    Drum instrument notes
    */
    this.drumNotes = drumNotes;

    /**
    List of buttons
        x
        y
        width
        height
        click
        draw
    */
    this.buttons = [];

    // Compute the number of rows
    var numRows = this.leadNotes.length + this.drumNotes.length;

    var sequencer = this;
//    window.addEventListener('resize', sequencer.render(), false);

    this.centreOfCanvas = function(canvas) {
        return {
            x: canvas.width / 2,
            y: canvas.height / 2
        }
    }
    this.ellipsePointAt = function(x0,y0,xl,yl,a) {
        return {
            x: x0 + xl * Math.sin(a),
            y: y0 + yl * Math.cos(a)
        }
    }
    var self = this;
    this.resize = function () {
        self.centre = self.centreOfCanvas(canvas);
        self.ellipseMajor = canvas.width / 2.25;
        self.ellipseMinor = canvas.height / 2.25;
        sequencer.render();
    }
    window.addEventListener('resize', this.resize, false);
    this.resize();

    // These are proportional to the ellipse major/minor axes
    this.ellipseBottom = 0.4;
    this.ellipseTop = 0.9;

    this.makePathFromCorners = function(corners, ctx) {
      ctx.beginPath();
      ctx.moveTo(corners[0].x,corners[0].y);
      ctx.lineTo(corners[1].x,corners[1].y);
      ctx.lineTo(corners[2].x,corners[2].y);
      ctx.lineTo(corners[3].x,corners[3].y);
      ctx.lineTo(corners[0].x,corners[0].y);
    }
    for (var row = 0; row < numRows; ++row)
    {
        for (var col = 0; col < Sequencer.NUM_COLS; ++col)
        {
            var x = Sequencer.SQR_WIDTH * col;
            var y = Sequencer.SQR_HEIGHT * row;
            var ySize = 100;
            var delta = 0.01; // height of buttons...
            var width = Math.PI/180*10;
            var ratioX = x / canvas.clientWidth;
            var ratioX1 = (x + Sequencer.SQR_WIDTH) / canvas.clientWidth;
            var ratioY = sequencer.ellipseBottom +
                y / canvas.clientHeight * (sequencer.ellipseTop - sequencer.ellipseBottom);
            var ratioY1 = sequencer.ellipseBottom +
                (y+Sequencer.SQR_HEIGHT) / canvas.clientHeight * (sequencer.ellipseTop - sequencer.ellipseBottom);
            var corners = [
              sequencer.ellipsePointAt(sequencer.centre.x,sequencer.centre.y,
                  sequencer.ellipseMajor*ratioY,sequencer.ellipseMinor*ratioY,
                  Math.PI * 2 * ratioX),
              sequencer.ellipsePointAt(sequencer.centre.x,sequencer.centre.y,
                  sequencer.ellipseMajor*ratioY,sequencer.ellipseMinor*ratioY,
                  Math.PI * 2 * ratioX1),
              sequencer.ellipsePointAt(sequencer.centre.x,sequencer.centre.y,
                  sequencer.ellipseMajor*(ratioY1),sequencer.ellipseMinor*(ratioY1),
                  Math.PI * 2 * ratioX1),
              sequencer.ellipsePointAt(sequencer.centre.x,sequencer.centre.y,
                  sequencer.ellipseMajor*(ratioY1),sequencer.ellipseMinor*(ratioY1),
                  Math.PI * 2 * ratioX)
            ];
            //
            // Approximate the location of the button.
            //
            var button = this.makeButton(
                Sequencer.SQR_WIDTH * col,
                Sequencer.SQR_HEIGHT * row,
                Sequencer.SQR_WIDTH,
                Sequencer.SQR_HEIGHT,
                corners,
                function click()
                {
                    this.onState = !this.onState;

                    sequencer.render();
                },
                function draw(ctx)
                {
                    // Draw ellipse-style button...
                    ctx.fillStyle = this.color;

                    //this.useRectangleGrid = true;
                    if (this.useRectangleGrid) {
                      ctx.moveTo(this.x, this.y);
                      ctx.fillRect(
                          this.x + Sequencer.SQR_OUTER_TRIM,
                          this.y + Sequencer.SQR_OUTER_TRIM,
                          this.width - (2 * Sequencer.SQR_OUTER_TRIM),
                          this.height - (2 * Sequencer.SQR_OUTER_TRIM)
                      );

                      if (this.onState === false)
                      {
                          ctx.fillStyle = 'rgb(0, 0, 0)';
                          ctx.fillRect(
                              this.x + Sequencer.SQR_INNER_TRIM,
                              this.y + Sequencer.SQR_INNER_TRIM,
                              this.width - (2 * Sequencer.SQR_INNER_TRIM),
                              this.height - (2 * Sequencer.SQR_INNER_TRIM)
                          );
                      }
                    } else {
                      ctx.strokeStyle="#FF0000";
                      sequencer.makePathFromCorners(this.corners,ctx);
                      if (this.onState === false)
                      {
                          ctx.fillStyle = 'rgb(0, 0, 0)';
                      } else {
                          ctx.fillStyle = 'rgb(#FF, 0, 0)';
                      }

                      ctx.stroke();
                      ctx.fill();

                    }

                }
            );

            button.onState = false;
            button.col = col;

            if (row < this.leadNotes.length)
            {
                button.color = 'rgb(255, 0, 0);';
                button.track = leadTrack;
                button.note = leadNotes[this.leadNotes.length - 1 - row];
            }
            else
            {
                button.color = 'rgb(255, 140, 0);';
                button.track = drumTrack;
                button.note = drumNotes[row - this.leadNotes.length];
            }
        }
    }

    // If a location hash is specified
    if (location.hash !== '')
    {
        this.parseHash(location.hash.substr(1));

        this.render();
    }
}

Sequencer.SQR_WIDTH = 20;
Sequencer.SQR_HEIGHT = 20;
Sequencer.SQR_OUTER_TRIM = 2;
Sequencer.SQR_INNER_TRIM = 4;

Sequencer.NUM_COLS = 32;
Sequencer.SQRS_PER_BEAT = 4;
Sequencer.NUM_BEATS = Sequencer.NUM_COLS / Sequencer.SQRS_PER_BEAT;

/**
Parse the sequencer state from a given hash string
*/
Sequencer.prototype.parseHash = function (hashStr)
{
    console.log('Parsing hash string');

    var sqrIdx = 0;

    // For each hash code character
    for (var i = 0; i < hashStr.length; ++i)
    {
        var code = hashStr.charCodeAt(i) - 97;

        for (var j = 0; j < 4; ++j)
        {
            var bit = (code % 2) === 1;
            code >>>= 1;

            this.buttons[sqrIdx].onState = bit;

            sqrIdx++;
        }
    }
}

/**
Generate a hash string from the sequencer state
*/
Sequencer.prototype.genHash = function ()
{
    var charCodes = [];

    var code = 0;
    var codeLen = 0;

    function pushCode()
    {
        var ch = code + 97;

        charCodes.push(ch);

        code = 0;
        codeLen = 0;
    }

    for (var i = 0; i < this.buttons.length; ++i)
    {
        var button = this.buttons[i];

        if (button.onState === undefined)
            continue;

        var bit = button.onState? 1:0;

        code = code + (bit << codeLen);
        codeLen++;

        if (codeLen === 4)
            pushCode();
    }

    if (codeLen > 0)
        pushCode();

    return String.fromCharCode.apply(null, charCodes);
}

/**
Create a clickable button
*/
Sequencer.prototype.makeButton = function (
    x,
    y,
    width,
    height,
    corners,
    click,
    draw
)
{
    var resize = function (oldHeight, oldWidth) {
        button.x *= (canvas.width / oldWidth);
        button.y *= (canvas.height / oldHeight);
        button.width *= (canvas.width / oldWidth);
        button.height *= (canvas.height / oldHeight);
        if (button.corners) {
            for (var i = 0; i < button.corners.length; ++i) {
                button.corners[i].x *= (canvas.width / oldWidth);
                button.corners[i].y *= (canvas.height / oldHeight);
            }
        }
        button.draw(canvasCtx);
    }
    var button = {
        x       : x,
        y       : y,
        width   : width,
        height  : height,
        corners : corners,
        click   : click,
        draw    : draw,
        resize  : resize,
    };

    this.buttons.push(button);

    return button;
}

/**
Click handling
*/
Sequencer.prototype.click = function (x, y)
{
    var ctx = canvas.getContext("2d");
    for (var i = 0; i < this.buttons.length; ++i)
    {
        var button = this.buttons[i];

        if (this.rectangularGrid || !button.corners) {
          if (x >= button.x && x < button.x + button.width &&
              y >= button.y && y < button.y + button.height)
              button.click();
        } else {
          this.makePathFromCorners(button.corners,ctx);
          if (ctx.isPointInStroke(x, y) || ctx.isPointInPath(x, y)) {
              button.click();
              break;
          }
        }
    }
}

/**
Draw the sequencer
*/
Sequencer.prototype.draw = function (canvas, ctx)
{
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all the buttons
    for (var i = 0; i < this.buttons.length; ++i)
        this.buttons[i].draw(ctx);

    // TODO: beat numbers
    // TODO: bar lines
    // TODO: note names

    var piece = this.piece;
    var playTime = piece.playTime;
    var totalTime = piece.beatTime(Sequencer.NUM_BEATS);

    var playPos = playTime / totalTime;
    var cursorPos = playPos * canvas.width;

    var cursorBot = Sequencer.SQR_HEIGHT * (this.leadNotes.length + this.drumNotes.length);

    if (playPos !== 0)
    {
        if (this.rectangularGrid) {
          // Draw the cursor line
          canvasCtx.strokeStyle = "white";
          canvasCtx.beginPath();
          canvasCtx.moveTo(cursorPos, 0);
          canvasCtx.lineTo(cursorPos, cursorBot);
          canvasCtx.closePath();
          canvasCtx.stroke();
        } else {
          // Draw the cursor line
          canvasCtx.strokeStyle = "white";
          canvasCtx.beginPath();
          var cursorAngle = playPos * 2 * Math.PI;
          var start = this.ellipsePointAt(this.centre.x, this.centre.y,
            this.ellipseBottom * this.ellipseMajor, this.ellipseBottom * this.ellipseMinor,
            cursorAngle);
          var end = this.ellipsePointAt(this.centre.x, this.centre.y,
            this.ellipseTop * this.ellipseMajor, this.ellipseTop * this.ellipseMinor,
            cursorAngle);
          canvasCtx.moveTo(start.x, start.y);
          canvasCtx.lineTo(end.x, end.y);
          canvasCtx.closePath();
          canvasCtx.stroke();
        }
    }
}

/**
Render note output to the piece
*/
Sequencer.prototype.render = function ()
{
    console.log('rendering sequencer grid');

    this.leadTrack.clear();
    this.drumTrack.clear();

    for (var i = 0; i < this.buttons.length; ++i)
    {
        var button = this.buttons[i];

        if (button.track === undefined)
            continue;

        if (button.onState === false)
            continue;

        var beatNo = button.col / Sequencer.SQRS_PER_BEAT;

        console.log(button.note.toString());

        this.piece.makeNote(
            button.track,
            beatNo,
            button.note,
            1 / Sequencer.SQRS_PER_BEAT
        );
    }

    location.hash = this.genHash();
}