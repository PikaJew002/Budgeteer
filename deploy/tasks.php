<?php

namespace Deployer;

desc('volta run npm run build');
task('volta:run:install', function () {
    cd('{{release_or_current_path}}');
    run('volta run npm install --production');
});
