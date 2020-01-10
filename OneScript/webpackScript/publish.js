var fs = require('fs');
var path = require('path');
var packageContent = require('./package.json');

const { exec } = require('child_process');


function start() {

    var copys = [
        {
            src: "./VueComponents/selector.html",
            dst: "./dist/VueComponents/selector.html"
        },
        {
            src: "./VueComponents/loading.html",
            dst: "./dist/VueComponents/loading.html"
        }
    ];

    copys.forEach(m => {
        //__dirname表示当前js所在目录
        //var sourceFile = path.join(__dirname, m.src);
        //var destPath = path.join(__dirname, m.dst);


        var readStream = fs.createReadStream(m.src);
        var writeStream = fs.createWriteStream(m.dst);
        readStream.pipe(writeStream);
        console.log(m.src + "拷贝完毕")
    });

    //修改版本号
    //package.json
    console.log("原始版本号：" + packageContent.version);
    var arr = packageContent.version.split('.');
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] == 99) {
            continue;
        }
        else {
            arr[i] = parseInt(arr[i]) + 1;
            break;
        }
    }
    packageContent.version = arr.join(".");

    fs.writeFileSync("./dist/package.json", JSON.stringify(packageContent), { encoding: "utf8" });
    console.log("新版本号：" + packageContent.version);

    exec("npm publish",
        {
            cwd : "./dist",
        },
        function (err, outstr, errstr) {
        if (outstr)
            console.log(outstr);
        if (errstr)
            console.log(errstr);
    });
}

function doTsc() {
    var proPath = path.join(__dirname, "../OneScript.csproj");
    console.log(proPath);
    console.log("开始编译 如果缺少tsc命令，安装：npm install -g typescript");
    exec('tsc',
        function (err, outstr, errstr) {
            console.log("编译结束");

            if (errstr)
                console.log(errstr);
            else {
                start();
            }
        });
}

//查询当前版本号
exec('npm view jack-one-script',
    function (err, outstr, errstr) {
        if (outstr) {
            var match = /latest\u001b\[39m\u001b\[22m: ([0-9|\.]+)/.exec(outstr);
            packageContent.version = match[1];
            doTsc();
        }
        if (errstr)
            console.log(errstr);
    });


