
var routes = [];
const requireComponent = require.context('.', true, /[\w]+\/Routes\/[\w]+\.vue$/);
requireComponent.keys().forEach(filename=>{
    const componentConfig = requireComponent(filename);

    if (typeof componentConfig.default.routes != 'undefined')
    {
        for (var i=0;i<componentConfig.default.routes.length;i++)
        {
            var route = componentConfig.default.routes[i];
            route.component = componentConfig.default;
            routes.push(route);
        }
    }
});


export default routes;