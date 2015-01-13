function route(handle, pathname, response,request){
    console.log("router.js and the requested pathname is" +pathname);
    if(typeof handle[pathname]==='function'){
        return handle[pathname](response,request);
    }else{
        //console.log("No request for handle found for "+ pathname);
        response.writeHead(404,{"Content-Type":"text/plain"});
        response.write("404 Not Found");
        response.end();
    }
}

exports.route = route;