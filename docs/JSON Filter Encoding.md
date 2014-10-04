Philosophy of JSON Encoding
---------------------------

When serializing data structures, specifically data structures involving
operations, there are three operator positions available:

* Prefix - ```+ a b```
* Infix - ```a + b```
* Suffix - ```a b +```

Personally, I find infix ordering aesthetically pleasing in the limited case
of binary commutative operators.  Unfortunately, the many operators have
a variable number of operands.

It would be nice to build upon existing JSON-based operators, but it seems
little thought was put into the serialization:

* MongoDB uses a combination of [infix notation](http://docs.mongodb.org/manual/reference/operator/query/gt/#op._S_gt),
[prefix notation](http://docs.mongodb.org/manual/reference/operator/query/and/#op._S_and),
and [nofix notation](http://caffinc.com/blog/2014/02/mongodb-eq-operator-for-find/),
which is clearly a mess.
* ElasticSearch has standardized on a [prefix notation](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-term-filter.html),
and has some oddities like the [range filter](http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-range-filter.html)
which is a combination of prefix and suffix, and probably a side effect of some
leaky abstraction.

For these reasons we will declare our own JSON filter format:  It uses prefix
ordering; and is consistent with functional notation.

<table><tr>
<td>Operation</td>
<td>Qb Query</td>
<td>MongoDB</td>
<td>ElasticSearch</td>
</tr><tr>
<td>Equality</td>
<td><code>{"eq": {field: value}}</code></td>
<td><code>{field: value}</code></td>
<td><code>{"term": {field: value}}</code></td>
</tr><tr>
<td>Inequality<br><code>gt, gte, ne, lte, lt</code></td>
<td><code>{"gt": {field: value}}</code></td>
<td><code>{field: {"$gt": value} }</code></td>
<td><code>{"range": {field: {"gt":value}}}</code></td>
</tr><tr>
<td>Logical Operators<br><code>and, or</code></td>
<td><code>{"and": [a, b, c, ...]}</code></td>
<td><code>{"$and": [a, b, c, ...]}</code></td>
<td><code>{"and": [a, b, c, ...]}</code></td>
</tr><tr>
<td>Match All</td>
<td><code>true</code></td>
<td><code>{}</code></td>
<td><code>{"match_all": {}}</code></td>
</tr><tr>
<td>Exists</td>
<td><code>{"exists": field}</code><br>(null values do not exist)</td>
<td><code>{field: {"$exists": true}}<br>(null values exist)</code></td>
<td><code>{"exists": {"field": field}}</code></td>
</tr><tr>
<td>Missing</td>
<td><code>{"missing": field}</code><br>(null values are missing)</td>
<td><code>{field: {"$exists": false}}</code><br>(values are not missing)</td>
<td><code>{"missing": {"field": field}}</code></td>
</tr><tr>
<td>Match one of many</td>
<td><code>{"in": {field:[a, b, c, ...]}</code></td>
<td><code>{field {"$in":[a, b, c, ...]}</code></td>
<td><code>{"terms": {field: [a, b, c, ...]}</code></td>
</tr><tr>
<td>Prefix</td>
<td><code>{"prefix": {field: prefix}}</code></td>
<td><code>{field: {"$regex": /^prefix\.*/}}</code></td>
<td><code>{"prefix": {field: prefix}}</code></td>
</tr><tr>
<td>Regular Expression</td>
<td><code>{"regex": {"field":regex}</code></td>
<td><code>{field: {"$regex": regex}}</code></td>
<td><code>{"regexp":{field: regex}}</code></td>
</tr><tr>
<td>Script</td>
<td><code>{"script": javascript}</code></td>
<td><code>{"$where": javascript}</code></td>
<td><code>{"script": {"script": mvel_script}}</code></td>
</tr></table>


