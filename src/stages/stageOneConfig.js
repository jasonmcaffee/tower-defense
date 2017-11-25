import RotatingBox from 'components/RotatingBox';
import Floor from 'components/Floor';
import TysonsMom from 'components/TysonsMom';
import Player from 'components/Player';

import {generateRandomNumber} from "core/core";

export const stageOneConfig = {
  createChildren({children=[], scene}={}){
    children.push(new RotatingBox());
    let min = -90;
    let max = 90;
    let grn = generateRandomNumber;
    for(let i=0; i < 1000; ++i){
      children.push(new RotatingBox({x:grn({min, max}), y:grn({min, max}), z:grn({min, max})}));
    }
    children.push(new Floor());

    children.push(new TysonsMom());

    children.push(new Player());
    return children;
  }
}