<?php
/**
 * Script for the autocompletion in jQuery Plugin tagedit.
 *
 * @author Oliver Albrecht <info@webwork-albrecht.de>
 */

$autocompletiondata = array(
    3 => 'Hazel Grouse',
    4 => 'Common Quail',
    5 => 'Common Pheasant',
    6 => 'Northern Shoveler',
    7 => 'Greylag Goose',
    8 => 'Barnacle Goose',
    9 => 'Lesser Spotted Woodpecker',
    10 => 'Eurasian Pygmy-Owl',
    11 => 'Dunlin',
    13 => 'Black Scoter',
    14 => 'Eurasian Wryneck',
    15 => 'Little Owl',
    16 => 'Eurasian Curlew',
    17 => 'Ruff',
    18 => 'Little Tern',
    19 => 'Merlin',
    20 => 'Bluethroat',
    21 => 'Redwing',
    22 => 'Wood Nuthatch',
    23 => 'Firecrest',
    24 => 'Goldcrest',
    25 => 'Bearded Parrotbill',
    26 => 'Chaffinch',
    27 => 'Brambling',
    28 => 'Hawfinch',
    29 => 'Goldcrest',
);

if(isset($_GET['term'])) {
    $result = array();
    foreach($autocompletiondata as $key => $value) {
        if(strlen($_GET['term']) == 0 || strpos(strtolower($value), strtolower($_GET['term'])) !== false) {
            $result[] = '{"id":'.$key.',"label":"'.$value.'","value":"'.$value.'"}';
        }
    }
    
    echo "[".implode(',', $result)."]";
}
?>