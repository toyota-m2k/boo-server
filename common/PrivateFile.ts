import * as path from "path";

/**
 * もともと、dist/private/* のファイルを読み込むときに、各モジュール毎に相対パスで指定していたが、
 * ts-node を使ってsrcフォルダから実行してしまうと、パスが解決できなくなるので、絶対パスで指定するように変更するとともに、
 * このクラスで一元管理することとした。
 */
export default class PrivatePath {
    static privDir = "dist/private/";

    public static get(filename: string): string {
        return path.join(process.cwd(), PrivatePath.privDir, filename);
    }

    public static loadJson(filename: string) : any|null {
        try {
            return require(this.get(filename))
        } catch {
            return null
        }
    }
}