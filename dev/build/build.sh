#!/bin/bash

BUILDNAME=${2}
FILENAME=$(grep create ${BUILDNAME} | cut -f2 -d' ' | tr '\r\n' ' ')

cat /dev/null > ${FILENAME}

for jsFile in $(grep add ${BUILDNAME} | cut -f2 -d' ' | tr '\r\n' ' '); do 
        cat ${1}/${jsFile} >> ${FILENAME}
done
