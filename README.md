
Qb Query Library
================

Requirements
------------

Access to one of the bug clusters is required.  Use [ElasticSearch Head](https://github.com/mobz/elasticsearch-head) to
test connectivity.

  - Proxy to public cluster<br>```http://esfrontline.bugs.mozilla.org:80/public_bugs/bug_version```
  - Direct to public cluster (need VPN access)<br>```http://elasticsearch-zlb.bugs.scl3.mozilla.com:9200/public_bugs/bug_version```
  - Direct to private cluster (need VPN access)<br>```http://elasticsearch-private.bugs.scl3.mozilla.com:9200/private_bugs/bug_version```

Setup
-----

Simply clone the git repo:

**git clone https://github.com/klahnakoski/Qb.git**
    
    Cloning into 'Qb'...
	remote: Counting objects: 6563, done.
	remote: Compressing objects: 100% (3142/3142), done.
	remote: Total 6563 (delta 4485), reused 5226 (delta 3148)
	Receiving objects: 100% (6563/6563), 17.89 MiB | 234 KiB/s, done.
	Resolving deltas: 100% (4485/4485), done.
	Checking out files: 100% (437/437), done.


Documentation
-------------

  - [Tutorial on querying ElasticSearch](docs/BZ_Tutorial.md)
  - [Tutorial on MVEL and advanced querying](docs/MVEL_Tutorial.md)
  - [Reference document covering the query format](docs/Qb_Reference.md)
  - [Dimension Definitions](docs/Dimension Definitions.md)