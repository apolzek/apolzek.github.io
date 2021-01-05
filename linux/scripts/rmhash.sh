#by: apolzek

md5sum * | sort -n > .file 
filename='.file'
n=1
x=1
while read line; do
    current_hash=$(echo $line | awk {'print $1'})
    echo "[debugging] current_hash: $current_hash"
    x=$(($n + 1))
    next_hash=$(awk NR==$(echo $x) .file | awk {'print $1'})
    echo "[debugging] next_hash:  $next_hash"

    if [ -z $next_hash ]; then
        echo "[debugging] end"
        rm .file
        exit
    fi

    if [ $current_hash == $next_hash ]; then
        echo "[debugging] remove duplicate"

        first_duplicate_file=$(echo $line | cut -c34-)
        echo "[debugging] name first duplicate file: $first_duplicate_file"

        second_duplicate_file=$(awk NR==$(echo $x) .file | cut -c35-)
        echo "[debugging] name second duplicate file: $second_duplicate_file"
    
        rm "$second_duplicate_file"
    fi
    echo ""
    n=$((n+1))
done < $filename