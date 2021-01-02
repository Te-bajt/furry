#!/bin/bash

CWD=`pwd`
BASEDIR=`dirname $0`
JSON_FILE=$BASEDIR/service-2.json
DATE=$(jq -r '.metadata.apiVersion' $JSON_FILE)
SDK_MODULE_NAME=aws-sdk
SERVICE='ClientTelemetry'
SERVICE_LOWERCASE=`echo $SERVICE | tr '[:upper:]' '[:lower:]'`
AWS_SDK_DIR=aws-sdk-js
TYPEFILE=$BASEDIR/$SERVICE_LOWERCASE.d.ts

# get a fresh sdk
git clone --depth 1 https://github.com/aws/aws-sdk-js.git $AWS_SDK_DIR

# copy our json definition to the api dir
cp $JSON_FILE $AWS_SDK_DIR/apis/$SERVICE_LOWERCASE-$DATE.normal.json
cd $AWS_SDK_DIR

# patch metadata.json so the sdk scripts know about our json file
echo $(jq '.["'$SERVICE_LOWERCASE'"] = {"name": "'$SERVICE'"}' apis/metadata.json) > apis/metadata.json

# generate types
node scripts/typings-generator.js

# copy the type file
cd $CWD
cp $AWS_SDK_DIR/clients/$SERVICE_LOWERCASE.d.ts $BASEDIR/

# patch the type file imports to be relative to the SDK module
sed -i.bak "s/^\(import .* from.*\)\.\.\(.*\)$/\1$SDK_MODULE_NAME\2/g" $TYPEFILE

# add a header stating the file is autogenerated
echo "/**
 * THIS FILE IS AUTOGENERATED BY 'generate_types.sh'.
 * DO NOT EDIT BY HAND.
 */
`cat $TYPEFILE`" > $TYPEFILE

# cleanup
rm -rf $AWS_SDK_DIR