///<reference path="../typings/index.d.ts"/>
import {BaseModelKnex} from "./base_model_knex";
import {BaseModelMongoDb} from "./base_model_mongodb";
import {BaseModelOrientJs} from "./base_model_orientjs";
import {BaseModelRest} from "./base_model_rest";
import {BadParameterError as BadParameterErrorClass} from "./errors/bad_parameter_error";
import {BaseError as BaseErrorClass} from "./errors/base_error";
import {InternalError as InternalErrorClass} from "./errors/internal_error";
import {NotFoundError as NotFoundErrorClass} from "./errors/not_found_error";

export let ModelKnex = BaseModelKnex;

export let ModelMongoDb = BaseModelMongoDb;

export let ModelOrientJs = BaseModelOrientJs;

export let ModelRest = BaseModelRest;

export let BadParameterError = BadParameterErrorClass;

export let BaseError = BaseErrorClass;

export let InternalError = InternalErrorClass;

export let NotFoundError = NotFoundErrorClass;
