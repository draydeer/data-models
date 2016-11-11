# Data models and mappers

Provides the common functionality like basic CRUD operations over a variety of data source drivers.
Also provides the minimalistic functionality of the data model with the some methods such as the abstract saving method.

### Functionality purposes

The purposes of this functionality is to build a variety of common operations (CRUD most of all) with CERTAIN external behaviours wrapping series of low-level operations.
The functionality IS NOT PRESENTED as the replacement is each case of a may be similar low-level operation of the corresponding driver.
The functionality IS NOT PRESENTED as standardizing of similar low-level operations over all of the variety of drivers.
If you need to do some specific operation over a driver use this driver directly.
The functionality anyway exists as NOT ALTERNATIVE beside the low level functionality of the corresponding driver.

### Functionality as-is

The functionality provides two ways of working with the target driver - as the model and as the mapper.
The model provides a class with the static CRUD methods and the some methods of the minimalistic functionality of the data as the entity.
The mapper provides a class with the static CRUD methods and the ability of configuring of the internal environment (as a service) in which these methods will work.
