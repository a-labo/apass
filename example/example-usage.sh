#!/bin/bash

### Set up ###

# Save master password as env variables.
# The password should be shared with team members beforehand.
$ export APASS_PASSWORD=xxxxxxxx

$ export APASS_REPO=git@github.com:my-account/my-vault-repo.git


### Read values ###

# List available
$ apass keys

# Get a value
$ apass get foo
# Get a raw value
$ apass get -r foo

# Get all values
$ apass all


### Write values ###

# Set a new value
$ apass set foo "This is value of bar"

# Delete a value
$ apass del bar


### Manage mater password ###

# Update password
$ apass passwd "my_new_password"
$ export APASS_PASSWORD="my_new_password"


### Sync with remote repo ###

# Bind remote repo
$ apass bind

# Pull from git
$ apass pull

# Push to git
$ apass push