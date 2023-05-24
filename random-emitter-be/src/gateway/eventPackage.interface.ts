export default interface EventPackage {
    action: String //Can be 'start', 'stop' or 'setParam'
    channelId: Number //ChannelId can be 1 or 2
    data?: {
        interval?: number,
        range?: number
    } 
}