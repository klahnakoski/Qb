


Requirements
============

Access to one of the bugs clusters is required

  - Proxy to public cluster (need VPN to **TOR**)<br>'``http://klahnakoski-es.corp.tor1.mozilla.com:9201/public_bugs/bug_version```
  - Proxy to public cluster<br>```http://esfrontline1.bugs.scl3.mozilla.com:9292/public_bugs/bug_version```
  - Direct to the public cluster<br>```http://elasticsearch1.bugs.scl3.mozilla.com:9200/public_bugs/bug_version```
  - Proxy to private cluster (need VPN to **TOR**)<br>```http://klahnakoski-es.corp.tor1.mozilla.com:9204/private_bugs/bug_version```
  - Metrics' private cluster (need VPN to **MPT**)<br>```http://elasticsearch7.metrics.scl3.mozilla.com:9200/bugs/bug_version```
  - Direct to private cluster (need **LDAP**)<br>```http://elasticsearch4.bugs.scl3.mozilla.com:9200/private_bugs/bug_version```

Setup
=====

After cloning, you must ```git submodule init``` and ```git submodule update```.  Here is my full session:

**git clone https://github.com/klahnakoski/Qb.git**
    
    Cloning into 'Qb'...
	remote: Counting objects: 6563, done.
	remote: Compressing objects: 100% (3142/3142), done.
	remote: Total 6563 (delta 4485), reused 5226 (delta 3148)
	Receiving objects: 100% (6563/6563), 17.89 MiB | 234 KiB/s, done.
	Resolving deltas: 100% (4485/4485), done.
	Checking out files: 100% (437/437), done.

**cd Qb**

**git submodule init**

    Submodule 'html/lib/jsImport' (https://github.com/klahnakoski/jsImport.git) registered for path 'html/lib/jsImport'
    Submodule 'html/lib/jsThreads' (https://github.com/mozilla/jsThreads.git) registered for path 'html/lib/jsThreads'

**git submodule update**

    Cloning into 'html/lib/jsImport'...
    remote: Counting objects: 17, done.
    remote: Compressing objects: 100% (13/13), done.
    remote: Total 17 (delta 1), reused 14 (delta 1)
    Unpacking objects: 100% (17/17), done.
    Submodule path 'html/lib/jsImport': checked out '9496679302367d4c21b86684a69f5eb682e09541'
    Cloning into 'html/lib/jsThreads'...
    remote: Counting objects: 43, done.
    remote: Compressing objects: 100% (35/35), done.
    emote: Total 43 (delta 15), reused 31 (delta 6)
    Unpacking objects: 100% (43/43), done.
    Submodule path 'html/lib/jsThreads': checked out '0feb4d42a0b3e1583e4e2179e068546850c78487'

Git Pull Origin ...
-------------------

Beyond the regular Git syntax to pull updates, the magic command to pull submodule updates is ```git submodule foreach
git pull origin master```


Other Notes
-----------
The interesting code starts in [./html/es](./html/es)

  - [Tutorial on querying ElasticSearch](docs/BZ_Tutorial.md)
  - [Tutorial on MVEL and advanced querying](docs/MVEL_Tutorial.md)
  - [Reference document covering the query format](docs/Qb_Reference.md)
  - [Dimension Definitions](docs/Dimension Definitions.md)