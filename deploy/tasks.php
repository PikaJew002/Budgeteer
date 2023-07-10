<?php

namespace Deployer;

desc('volta run npm run build');
task('volta:run:install', function () {
    cd('{{release_or_current_path}}');
    run('volta run npm install');
});

desc('volta run npm install');
task('volta:run:prod', function () {
    cd('{{release_or_current_path}}');
    run('volta run npm run production');
});

desc('download build artifacts from Github Actions workflow runn');
task('gh:action:download', function () {
    cd('{{release_or_current_path}}');
    run('gh run download '. getenv('GITHUB_RUN_ID') .' -n npm-build');
});