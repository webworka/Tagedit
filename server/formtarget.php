<?php
/**
 * Script for evaluationg the form that is send from jQuery Plugin tagedit.
 *
 * @author Oliver Albrecht <info@webwork-albrecht.de>
 *
 */

//echo '<pre>' . print_r($_POST['tag'], true) . '</pre>';exit;
$showResult = false;
if(array_key_exists('save', $_POST) && (array_key_exists('tag', $_POST) || array_key_exists('formdata', $_POST))) {
    // Include the autocompleteScript to know what was in the database
    include ('autocomplete.php');
    
    $result = array('new' => array(), 'deleted' => array(), 'changed' => array(), 'not changed' => array());
    $tags = array_key_exists('tag', $_POST)? $_POST['tag'] : $_POST['formdata']['tags'];
    $showResult = false;
    
    foreach($tags as $key => $value) {
        if(preg_match('/([0-9]*)-?(a|d)?$/', $key, $keyparts) === 1) {
            $showResult = true;
            if(isset($keyparts[2])) {
                switch($keyparts[2]) {
                    case 'a':
                        if($autocompletiondata[$keyparts[1]] != $value) {
                            // Items has changed
                            $result['changed'][] = $keyparts[1] . ' (new value: "' . $value . '")';
                        }
                        else {
                            $result['not changed'][] = $keyparts[1] . ' ("' . $value . '")';
                        }
                        break;
                    case 'd':
                        $result['deleted'][] = $keyparts[1] . ' ("' . $value . '")';
                        break;
                }
            }
            else {
                $result['new'][] = $key . ' ("' . $value . '")';
            }
        }
    }
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de">
<head>
    <title>jQuery Plugin tagedit - Tageditor</title>
    
    <meta name="generator" content="Komodo IDE"  />
    <meta name="author" content="Oliver Albrecht" />
    <meta name="description" content="Example Page for the jQuery Plugin tagedit. It offers an inputfield for adding, editing und deleting keywords, tags and other lists. There is also autocompletion" />
    <meta name="robots" content="index, follow" />
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />

    <meta http-equiv="content-language" content="de"/>
    <meta name="language" content="de"/>
    
    <link rel="shortcut icon" href="../favicon.ico"/>
    
    <link rel="StyleSheet" href="../css/jquery.tagedit-1.0.0.css" type="text/css" media="all"/>
    </head>
<body>
<h1>Tagedit result</h1>
<a href="javascript:history.back()" title="Back">Back to inputpage</a>
<?php if($showResult) :?>
    <p>The following inputs where received:</p>
    <?php foreach($result as $key => $results) : ?>
        <h2>Tags that are <?php echo $key; ?></h2>
        <?php if(count($results) > 0) :?>
            <ul>
                <?php foreach($results as $tag): ?>
                    <li>Id: <?php echo $tag; ?></li>
                <?php endforeach; ?>
            </ul>
        <?php else: ?>
            <p>nothing</p>
        <?php endif; //count(dleted) > 0?>
    <?php endforeach; ?>
    
    
<?php else: ?>
    <p>You did not enter any data</p>
<?php endif; // $_POST['tag'] ?>

</body>
</html>