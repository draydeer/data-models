///<reference path="../typings/index.d.ts"/>
import {BaseModelKnex} from "./base_model_knex";
import {BaseModelMongoDb} from "./base_model_mongodb";
import {BaseModelOrientJs} from "./base_model_orientjs";
import {BaseModelRest} from "./base_model_rest";

export let ModelKnex = BaseModelKnex;

export let ModelMongoDb = BaseModelMongoDb;

export let ModelOrientJs = BaseModelOrientJs;

export let ModelRest = BaseModelRest;
