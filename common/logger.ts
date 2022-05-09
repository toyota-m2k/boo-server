// 使い方
// #import logManager from "./utils/logger";
// const logger = logManager.enable(@"CategoryName");
// logger.error/warn/info/debug/stack("message");
//
// category はそれぞれで適当に決める。
// フィルタするときに category ごとにまとめて設定する。

// import moment from "moment";
import * as log4js from "log4js";
import PrivatePath from "./PrivateFile"

const config = PrivatePath.loadJson("log4js.json") ?? {
    appenders: {
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: ['console'], level: 'all' },
        access: { appenders: ['console'], level: 'all' }
    }
}

const logger = log4js.configure(config).getLogger()


export enum LogLevel {
    LOG_LEVEL_DEBUG = 0,
    LOG_LEVEL_INFO = 1,
    LOG_LEVEL_WARN = 2,
    LOG_LEVEL_ERROR = 3
}

export interface ILogger {
    error(msg:any) :void;
    warn(msg:any) : void;
    info(msg:any) : void;
    debug(msg:any) : void;
    stack(e: Error, msg?: any): void;
    stack_level(e:Error, level:Number, msg?: any): void;
    chrono<T>(msg: string, fn: () => Promise<T>): Promise<T>;
}

class NullLogger implements ILogger {
    public error(msg:any) { }
    public warn(msg:any) { }
    public info(msg:any) { }
    public debug(msg:any) { }
    public stack(e: Error, msg?: any) { }
    public stack_level(e:Error, level:Number, msg?: any): void { }
    public chrono<T>(msg: string, fn: () => Promise<T>): Promise<T> {
        return fn();
    }
}

class Logger implements ILogger {
    private name!: string;
    constructor(name: string) {
        this.name = name;
    }

    // static COLOR_BLACK = "\x1b[30m";
    // static COLOR_RED = "\x1b[31m";
    // static COLOR_GREEN = "\x1b[32m";
    // static COLOR_YELLOW = "\x1b[33m";
    // static COLOR_BLUE = "\x1b[34m";
    // static COLOR_MAGENTA = "\x1b[35m";
    // static COLOR_CYAN = "\x1b[36m";
    // static COLOR_WHITE = "\x1b[37m";
    // static COLOR_DEFAULT = "\x1b[39m";

    // static COLOR_MSG = Logger.COLOR_BLACK;
    // static COLOR_ERR = Logger.COLOR_RED;

    // private jstNow(): string {
    //     return moment().utcOffset(9).format("YYYY/MM/DD HH:mm:ss (ZZ)");
    // }

    public error(msg:any) {
        logger.error(`${this.name}(${process.pid})> ${msg}`)
    }
    public warn(msg:any) {
        logger.warn(`${this.name}(${process.pid})> ${msg}`)
    }
    public info(msg:any) {
        logger.info(`${this.name}(${process.pid})> ${msg}`)
    }
    public debug(msg:any) {
        logger.debug(`${this.name}(${process.pid})> ${msg}`)
    }

    public stack(e: Error, msg?: any) {
        // if (msg) {
        //     this.error(msg);
        // }
        // if (e.message) {
        //     this.error(e.message)
        // }
        // if (e.stack) {
        //     console.error(e.stack);
        // }
        // if (!e.message && !e.stack) {
        //     this.error(e);
        // }
        this.stack_level(e,LogLevel.LOG_LEVEL_ERROR,msg)
    }

    public stack_level(e:Error, level:Number, msg?: any): void {
        let g, s;
        switch(level) {
            case LogLevel.LOG_LEVEL_DEBUG:
                g = (v:string)=> this.debug(v);
                s = (v:string)=>logger.debug(v);
                break;
            case LogLevel.LOG_LEVEL_INFO:
                g = (v:string)=> this.info(v);
                s = (v:string)=>logger.info(v);
                break;
            case LogLevel.LOG_LEVEL_WARN:
                g = (v:string)=> this.warn(v);
                s = (v:string)=>logger.warn(v);
                break;
            case LogLevel.LOG_LEVEL_ERROR:
            default:
                g = (v:string)=> this.error(v);
                s = (v:string)=>logger.error(v);
                break;
        }

        if (msg) {
            g(msg);
        }
        if (e.message) {
            g(e.message)
        }
        if (e.stack) {
            s(e.stack);
        }
        if (!e.message && !e.stack) {
            g(e.toString());
        }
    }

    /**
     * 時間計測
     * @param msg メッセージ
     * @param fn  計測する関数
     */
    public async chrono<T>(msg: string, fn: () => Promise<T>): Promise<T> {
        this.info(`${msg} running ...`);
        const start = process.hrtime();
        try {
            const r = await fn();
            return r;
        } finally {
            const end = process.hrtime(start);
            this.info(`${msg} completed: ${end[1] / 1000000} ms`);
        }
    }
}

class LogManager {
    private nullLogger = new NullLogger();
    private defaultLogger = new Logger("");
    private loggerMap = new Map<string, ILogger>();

    public enable(name: string) : ILogger {
        if (!name||name == "default") {
            return this.defaultLogger;
        }
        let cur = this.loggerMap.get(name);
        if (!cur || cur instanceof NullLogger) {
            cur = new Logger(name);
            this.loggerMap.set(name, cur);
        }
        return cur;
    }

    public disable(name: string) {
        if (!name || name == "default") {
            return;
        }
        this.loggerMap.delete(name);
    }

    public logger(name?: string) : ILogger {
        if (!name || name == "default") {
            return this.defaultLogger;
        }
        return this.loggerMap.get(name) || this.nullLogger;
    }

    public connectAccessLog() {
        return log4js.connectLogger(log4js.getLogger('access'), { level: "info"})
    }

    // public noColors() {
    //     Logger.COLOR_BLACK = "";
    //     Logger.COLOR_RED = "";
    //     Logger.COLOR_GREEN = "";
    //     Logger.COLOR_YELLOW = "";
    //     Logger.COLOR_BLUE = "";
    //     Logger.COLOR_MAGENTA = "";
    //     Logger.COLOR_CYAN = "";
    //     Logger.COLOR_WHITE = "";
    //     Logger.COLOR_DEFAULT = "";
    // }

    // public logLevel:Number = LogLevel.LOG_LEVEL_DEBUG
}

const logManager = new LogManager;
export default logManager;
