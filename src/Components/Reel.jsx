import React, { Component, createRef } from 'react';
// import { render } from '@testing-library/react';

const iconHeight = 100;
const numReels = 5;
const rows = 3;


class Strip extends Component {

    constructor(props) {
        super(props);
        this.state = {
            symbols: this.props.symbolList
        }
    }

    buildStrip() {
        const symbols = this.state.symbols.slice();
        return (
            symbols.map((value, index) => (
                // icon
                <div style={iconStyle} key={index}>{value}</div>
            ))
        );
    }
    render() {
        return (
            <div style={{ ...stripStyle, ...{ top: this.props.pos } }}>
                {this.buildStrip()}
            </div>
        );
    }
}

class Reel extends Component {
    // Container for Strip(s)

    constructor(props) {
        super(props);
        this.symbolList = ['9', '9', '9', '10', 'J', 'Q', 'K', 'A', '\u2605'];
        this.state = {
            windowBottom: rows * iconHeight,
            stripHeight: iconHeight * this.symbolList.length,
            topPos: 0,
            bottomPos: iconHeight * this.symbolList.length,
            speed: 0,
            moveInterval: null,
            timeout: null,
            spinning: false
        }

    }

    spin = (speed) => {
        speed = speed ? speed : 30;
        this.setState({
            speed: speed,
            moveInterval: setInterval(this.moveReel, 33),
            spinning: true
        });
    }
    setDuration = (duration) => {
        this.setState({
            timeout: setTimeout(this.bounce, duration)
        })
    }
    stop = (overshoot) => {
        console.log(`Reel.stop()`);
        overshoot = overshoot ? overshoot : 0;
        if (this.state.moveInterval) {
            clearInterval(this.state.moveInterval);
        }
        if (this.state.timeout) {
            clearTimeout(this.state.timeout);
        }
        let nearestTop = Math.round(this.state.topPos / iconHeight) * iconHeight;
        let nearestBottom = Math.round(this.state.bottomPos / iconHeight) * iconHeight;

        // v because rounding to nearest tile can leave bottom strip up one iconheight from bottom of reels window
        const h = this.symbolList.length * iconHeight;
        const overlap = h - (rows * iconHeight);
        if (nearestBottom < (0 - overlap)) {
            nearestTop = nearestBottom;
            nearestBottom = nearestTop + h;
        }
        // ^ should really solve the initial rounding problem above rather than patch it up here

        this.setState({
            speed: 0,
            topPos: nearestTop + overshoot,
            bottomPos: nearestBottom + overshoot,
            moveInterval: null,
            spinning: false
        });
        if (overshoot === 0) {
            this.props.reelStopped();
        }
    }
    bounce = () => {
        console.log(`Reel.bounce()`);
        if (this.state.spinning) {
            const overshoot = iconHeight * 0.3;
            this.stop(overshoot);
            const speed = -overshoot / 5;
            this.spin(speed);
            setTimeout(this.stop, 165);
        }
    }
    moveReel = () => {
        // console.log(this);
        let { topPos, bottomPos, speed } = this.state;
        topPos += speed;
        bottomPos += speed;
        if (bottomPos > this.state.windowBottom) {
            bottomPos = topPos;
            topPos -= this.state.stripHeight;
        }

        this.setState({
            topPos: topPos,
            bottomPos: bottomPos
        })
    }
    sayHello() {
        console.log('hello from Reel');
    }

    readReel = () => {
        // const height = rows * iconHeight;
        const pos = this.state.bottomPos;
        const numSymbols = this.symbolList.length;
        const topIndex = (Math.round(-pos / iconHeight) + numSymbols) % numSymbols;
        // const topSymbol = this.symbolList[topIndex];
        const symbols = [...this.symbolList, ...this.symbolList];
        // console.log(symbols);
        // console.log(`---\n\rnumSymbols: ${numSymbols}`);
        // console.log(`pos: ${pos}`);
        // console.log(`topIndex: ${topIndex}`);
        // console.log(`Reel.readReel: ${topSymbol}`);
        const showing = symbols.slice(topIndex, topIndex + 3);
        console.log(showing);
        return showing;
    }

    getIcon = (row) => {
        const pos = this.state.bottomPos;
        const numSymbols = this.symbolList.length;
        const topIndex = (Math.round(-pos / iconHeight) + numSymbols) % numSymbols;
        const symbols = [...this.symbolList, ...this.symbolList];
        const icon = symbols[topIndex + row];
        return icon;
    }

    render() {

        let top = this.state.topPos + 'px';
        let bottom = this.state.bottomPos + 'px';

        return (
            <div style={reelStyle}>
                <Strip pos={top} symbolList={this.symbolList} />
                <Strip pos={bottom} symbolList={this.symbolList} />
            </div>
        )
    }
}

class Output extends Component {
    state = {
        message: "output goes here"
    }
    output = (message) => {
        this.setState({
            message: message
        })
    }
    render() {
        return (
            <div style={outputStyle} >
                {this.state.message}
            </div>
        );
    }
}
class Overlay extends Component {

    constructor(props) {
        super(props);
        this.canvas = createRef();
        this.colors = ['lime', 'fuchsia', 'teal', 'red', 'orange', 'yellow', 'skyblue'];
        this.colorIndex = 0;
        this.state = {
            width: iconHeight * numReels,
            height: iconHeight * rows
        }
    }

    componentDidMount() {
        // this.updateCanvas();
    }
    componentDidUpdate() {
        // this.updateCanvas();
    }
    clear(kill) {
        const ctx = this.canvas.current.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
        this.colorIndex = 0;
    }
    drawPath(path) {
        const ctx = this.canvas.current.getContext('2d');
        const offset = this.colorIndex * 3;
        ctx.lineWidth = 5;
        ctx.strokeStyle = this.colors[this.colorIndex];
        ctx.beginPath();
        path.forEach((row, index) => {
            if (index === 0) {
                ctx.moveTo(index * iconHeight + iconHeight * 0.5 - offset, row * iconHeight + iconHeight * 0.5 + offset);
            } else {
                ctx.lineTo(index * iconHeight + iconHeight * 0.5 - offset, row * iconHeight + iconHeight * 0.5 + offset);
            }
        });
        ctx.stroke();
        ctx.closePath();
        this.colorIndex = (this.colorIndex + 1) % this.colors.length;
        // this.updateCanvas();
    }
    render() {
        return (
            <canvas style={overlayStyle} ref={this.canvas} width={this.state.width} height={this.state.height} />
        );
    }
}

class Window extends Component {
    // Container for Reels


    constructor(props) {
        super(props);
        this.state = {
            bet: 100,
            balance: 10000,
            win: 0
        }
        this.reels = [];
        this.reelRefs = [];
        this.spinning = false;
        this.makeReels(numReels);
        this.output = createRef();
        this.overlay = createRef();
    }
    // componentWillMount() {
    //     this.addChild();
    // }

    spin() {
        console.log('spin()');
        // clearInterval(this.state.showWinsInterval);
        if (!this.spinning) {
            this.placeBet();
            this.output.current.output('...');
            this.overlay.current.clear(true);

            const spinDur = 1000;
            const addtlDurIncr = 200;
            this.reelRefs.forEach(function (reel, index) {
                // console.log(reel);
                reel.spin();
                reel.setDuration(spinDur + index * addtlDurIncr);
            })

            let that = this;
            setTimeout(function () {
                that.spinning = false;
            }, spinDur + (this.reelRefs.length - 1) * addtlDurIncr);

            this.spinning = true;
        } else {
            this.reelRefs.map((reel) => (reel.bounce()));

            this.spinning = false;
        }

    }
    reelStopped = () => {
        console.log(`Window.reelStopped()`);
        // are all reels stopped?
        let allStopped = this.reelRefs.every(reel => { return !reel.state.spinning });
        console.log(`allStopped: ${allStopped}`);
        if (allStopped) {
            this.spinComplete();
        }
    }
    spinComplete = () => {
        const matches = this.getWinningCombinations();
        // console.log('matches: ', matches);
        const s = matches.length != 1 ? 's' : '';
        const won = matches.length > 0 ? 'won!' : '';
        this.output.current.output(`${matches.length} line${s} ${won}`);
        // 
        this.overlay.current.clear();
        if (matches.length > 0) {
            this.stepThroughWins(matches);
            let payout = 0;
            matches.forEach(path => {
                let icon = this.reelRefs[0].getIcon(path[0]);
                payout += this.getCombinationValue(icon, path.length);
            });
            this.setState({
                win: payout
            });
            this.addBalance(payout);
        }

    }
    getWinningCombinations = () => {
        // Check for matching icons, at least 3 reels long, no more than 1 row apart
        let results = [];
        this.reelRefs.forEach(reel => {
            results.push(reel.readReel());
        });
        // results is reels-by-rows array
        function checkNextReel(path) {
            // This returns an array of arrays, each representing a path of matching symbols across reels
            // path is a list of reels/rows, where the index of each item is the reel and the value of the item is the row
            // This function then checks the next reel to see if any *connected* rows contain a matching icon.
            // All new paths, branching from arg path, are returned
            console.log(`checkNextReel(${path})`);
            // match is an array of rows, left to right, that all have same value
            // [0,1,0] means same value on reel0-row0, reel1-row1, reel2-row0
            const reel = path.length - 1;
            const row = path[path.length - 1];
            if (reel >= results.length) { return [path] };

            const iconToMatch = results[reel][row];
            const nextReel = results[reel + 1];
            let matchingPaths = [];
            // console.log(`iconToMatch: ${iconToMatch}`);
            // r2 is the row of nextReel
            let minRow = Math.max(row - 1, 0);
            let maxRow = Math.min(row + 1, rows - 1);
            // console.log(`rows ${minRow} to ${maxRow}`);

            for (let r2 = minRow; r2 <= maxRow; r2++) {
                // console.log(`__row ${r2}`);
                let icon2 = nextReel[r2];
                // console.log(`icon2(row ${r2}): ${icon2}`);
                if (icon2 === iconToMatch) {
                    // console.log(`match!`);
                    matchingPaths.push([...path, r2]);
                }
                // console.log(`r2: ${r2}, maxRow: ${maxRow}`);
            }

            return matchingPaths.length > 0 ? matchingPaths : [path];
        }

        // Seed the paths
        let matches = [];
        for (let row = 0; row < rows; row++) {
            matches.push([row]);
        }

        // Check results for winning combinations
        let newMatches = [];
        for (let reel = 1; reel < results.length; reel++) {
            // console.log(`_____reel ${reel}`);
            newMatches.length = 0;
            // console.log('matches.length: ', matches.length);
            // matches.forEach(path => {
            for (let m = 0; m < matches.length; m++) {
                // console.log('m: ', m);
                let path = matches[m];
                // console.log('path.length: ', path.length);
                if (path.length === reel) {
                    // path is not deadended yet
                    let newPaths = checkNextReel(path);
                    newMatches = [...newMatches, ...newPaths];
                    // console.log('newMatches: ', newMatches);
                } else {
                    newMatches = [...newMatches, path];
                }
            }
            // });
            matches = newMatches.slice();
            // console.log('matches: ', matches);
        }

        matches = matches.filter(path => path.length > 2);
        return matches;

    }

    stepThroughWins(paths) {
        this.overlay.current.clear(true);
        paths.forEach(path => {
            this.overlay.current.drawPath(path);
        });
        let dur = 2000;
        let index = 0;
        let path = paths[index];
        const s = paths.length != 1 ? 's' : '';
        const won = paths.length > 0 ? 'won!' : '';
        const linesWon = `${paths.length} line${s} ${won}`;
        let loop = 0;
        let message = '';
        let displayLoop = () => {
            if (this.spinning) { return };
            if (loop % 2 === 0) {
                message = linesWon + '\n ';
                this.overlay.current.clear();
                dur = 200;
            } else {
                // Draw Path
                path = paths[index];
                this.overlay.current.clear();
                this.overlay.current.drawPath(path);
                // Display win in Output
                message = `${linesWon}\n${this.announceWin(path)}`;
                index++;
                index = index % paths.length;
                dur = 2000;
            }
            message = message.split('\n').map((item, i) => <span key={i}>{item}<br /></span>);
            this.output.current.output(message);
            loop++;
            if (!this.spinning) { setTimeout(displayLoop, dur) };
        }
        setTimeout(displayLoop, dur);
        // this.setState({
        //     showWinsInterval: setTimeout(() => {
        //         if (loop % 2 === 0) {
        //             message = linesWon + '\n ';
        //             this.overlay.current.clear();
        //             dur = 2000;
        //         } else {
        //             // Draw Path
        //             path = paths[index];
        //             this.overlay.current.clear();
        //             this.overlay.current.drawPath(path);
        //             // Display win in Output
        //             message = `${linesWon}\n${this.announceWin(path)}`;
        //             index++;
        //             index = index % paths.length;
        //             dur = 200;
        //         }
        //         message = message.split('\n').map((item, i) => <span key={i}>{item}<br /></span>);
        //         this.output.current.output(message);
        //         loop++;
        //     }, dur)
        // });
    }

    announceWin(path) {
        const row = path[0];
        const icon = this.reelRefs[0].getIcon(row);
        const value = this.getCombinationValue(icon, path.length);
        let message = `${path.length} ${icon}s = ${value} coins`;
        return message;
        // this.output.current.output(message);
    }

    getCombinationValue(icon, pathLength) {
        const values = {
            '9': 0.10,
            '10': 0.15,
            'J': 0.20,
            'Q': 0.25,
            'K': 0.30,
            'A': 0.35,
            '\u2605': 0.50
        }
        const multiplier = Math.pow(3, pathLength - 3);
        const value = (values[icon] + values[icon] * multiplier) * this.state.bet;
        return Math.round(value);
    }
    placeBet() {
        this.addBalance(-1 * this.state.bet);
    }
    addBalance(amount) {
        this.setState({
            balance: this.state.balance + amount
        })
    }

    // Add to our spans refs array
    addReelRef = (node) => {
        console.log(`addReelRef(${node})`);
        this.reelRefs = [...this.reelRefs, node];
    }

    makeReels(numReels) {
        console.log(`makeReels(${numReels})`);
        this.reelRefs.length = this.reels.length = 0;
        for (let i = 0; i < numReels; i++) {
            console.log(`i: ${i}`);
            let reel = <Reel
                key={i}
                ref={this.addReelRef}
                reelStopped={this.reelStopped}
            />;
            this.reels.push(reel);
        }
    }
    renderReels() {
        return (
            this.reels.map((reel) => (reel))
        )
    }

    render() {
        console.log('Window.render()');
        return (
            <React.Fragment>
                <div style={outputStyle}>Balance: {this.state.balance} coins</div>
                <button onClick={() => { this.spin() }}>SPIN</button>
                <div style={windowStyle}>
                    {this.renderReels()}
                    <Overlay ref={this.overlay} />
                </div>
                <div>
                    <div style={outputStyle}>Last Win: {this.state.win} coins</div>
                    <Output ref={this.output} />
                    <div style={outputStyle}>Bet: {this.state.bet} coins</div>
                </div>

            </React.Fragment>
        );
    }
}

export default Window;

const iconStyle = {
    height: iconHeight + 'px',
    border: '1px solid grey',
    width: '100px',
    lineHeight: '100px',
    boxSizing: 'border-box',
    textShadow: '0 0 0.1em black'
};
const stripStyle = {
    position: 'absolute',
    width: '100px',
    fontSize: '40px',
    fontFamily: 'serif',
    fontWeight: 'bold',
    // border: '1px solid orange',
    borderLeft: '1px solid black',
    borderRight: '1px solid black',
    boxSizing: 'border-box'
}
const reelStyle = {
    position: 'relative',
    display: 'inline-block',
    width: '100px',
    height: '300px',
    border: '1px solid skyblue',
    borderLeft: '1px solid black',
    borderRight: '1px solid black',
    boxSizing: 'border-box',
    overflow: 'hidden'
}
const windowStyle = {
    position: 'relative',
    // boxSizing: 'border-box',
    height: (iconHeight * rows) + "px",
    border: '5px solid yellow',
    borderRadius: (iconHeight * 0.2) + 'px',
    overflow: 'hidden'
}

const outputStyle = {
    display: 'inline-block',
    verticalAlign: 'top',
    border: '1px solid black',
    padding: '1rem',
    fontSize: '1rem',
    borderRadius: '1rem'
}

const overlayStyle = {
    // border: '1px dashed blue',
    // boxSizing: 'border-box',
    position: 'absolute',
    top: '0',
    left: '0',
    opacity: '0.75'
}