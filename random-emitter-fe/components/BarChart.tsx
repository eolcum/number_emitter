import React, { useEffect, useState } from 'react'

/**
 * The component receives some props:
 * 
 * color: a string representing the color of the bars in the chart
 * numbers: an array of numbers representing the current stream of numbers being displayed in the chart
 * label: a label for the chart (optional)
 * channelNo: a number representing the channel number for the current stream of numbers
 * onSocketAction: a function that allows the component to send actions (such as "start" or "stop") to
 * the server over the web socket connection
 * The component also has state for the interval and range of the numbers being generated. These values
 * can be modified by the user using input fields and will be passed to the server when the user clicks
 * the "Set" button.
 */
type Props = {
    label?: string,
    channelNo: number,
    numbers: Array<number>,
    onSocketAction: Function,
    color: string
}
/**
 * BarChart component is a visualization of a stream of random numbers being generated and emitted by a server over a web socket connection. The component allows the user to start and stop the stream of numbers, and set the interval and range of the numbers being generated. It also displays a bar chart of the numbers in the stream.
 * When the user clicks the "Start" button, the component calls the onSocketAction function with the "start" action and the current channelNo, interval, and range values as arguments. When the user clicks the "Stop" button, the component calls the onSocketAction function with the "stop" action and the current channelNo as arguments. When the user clicks the "Set" button, the component calls the onSocketAction function with the "setParam" action, the current channelNo, and the current interval and range values as arguments.
 *  */ 
const BarChart = ({ color, numbers, label, channelNo, onSocketAction }: Props) => {

    const [interval, setInterval] = useState<number>(1000)
    const [range, setRange] = useState<number>(10)

    const onClickStart = () => {
        onSocketAction("start", channelNo, { interval, range })
    }
    const onClickStop = () => {
        onSocketAction("stop", channelNo)
    }
    const onClickSet = () => {
        onSocketAction("setParam", channelNo, { interval, range })
    }

    return (
        <>
            <div className="container-fluid m-4 border" style={{ width: "1000px", overflow: "auto", backgroundColor: "rgba(0,0,255,.1)" }}>
                {label}
                <div className="my-2" style={{ overflow: "auto" }}>
                    <div className=" row flex-row flex-nowrap align-items-end" style={{ height: "200px" }}>
                        {(numbers.map((number) =>
                            <div className="d-inline-block mx-1 " style={{ height: (Math.floor(100 * number / range)) + "%", width: "30px", backgroundColor: color }}></div>

                        ))}
                    </div>

                    <div className="row flex-row flex-nowrap">
                        {(numbers.map((number) =>

                            <div className="h-25 d-inline-block mx-1 text-center" style={{ width: "30px" }}>
                                {number.toString()}
                            </div>

                        ))}
                    </div>
                </div>
                <div className="row flex-row">
                    <div className="column col-5">

                        <div className="input-group mb-3">
                            <span className="input-group-text" id="interval">Interval</span>
                            <input type="number" id="interval" className="form-control"
                                min={100}
                                value={interval.toFixed()}
                                onChange={e => setInterval(Number(e.target.value))}
                                required />
                        </div>
                    </div>

                    <div className="column col-5">
                        <div className="input-group mb-3">
                            <span className="input-group-text" id="range">Range</span>
                            <input type="number" id="range" className="form-control"
                                value={range.toFixed()}
                                min={3}
                                onChange={e => setRange(Number(e.target.value))}
                                required />
                        </div>
                    </div>
                    <div className="column col-2">

                        <button
                            onClick={onClickSet}
                            className="btn btn-outline-primary btn-sm m-1"
                            style={{ width: "100px" }}>
                            Set
                        </button>
                    </div>
                </div>
                <div className="flex-row mb-2">
                    <button
                        onClick={onClickStart}
                        type="button"
                        className="btn btn-outline-primary btn-sm m-1"
                        style={{ width: "100px" }}>
                        Start
                    </button>
                    <button
                        onClick={onClickStop}
                        type="button"
                        className="btn btn-outline-danger btn-sm m-1"
                        style={{ width: "100px" }}>
                        Stop
                    </button>
                </div>
            </div>

        </>
    )
};

export default BarChart