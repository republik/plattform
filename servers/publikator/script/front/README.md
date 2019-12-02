# Split a front repo (date based)

How to split a front repo into two based on a date. `republik/magazine` is used as an example here.

All commands are relative to where this README is located.

## Run
0. Archive magazine repo on github (to avoid missing changes).

(Settings -> Danger Zone -> Archive this repository)

1. clone `magazine`

```
git clone --mirror git@github.com:republik/magazine.git
```
After that your folder should look like this:
```
-rw-r--r--  .gitignore
drwxr-xr-x  magazine
-rw-r--r--  README.md
-rwxr-xr-x  splitFront.js
```

2. run `splitFront.js`

```
./splitFront.js --date 2019-01-01 --path ~/Articles/magazine
```

Or by root children id:

```
./splitFront.js --id B3fTOtcv9 --path ~/Articles/magazine
```

After that you should get two additional folders, each containing `article.md` and `images/`.
```
drwxr-xr-x  magazine-after-2019-01-01
drwxr-xr-x  magazine-before-2019-01-01
```

3. create publikator docs

Open the publikator instance of your choice (eg. `republik-dev`) and create two new documents (template: front). Eg: `before-2019-01-01` and `after-2019-01-01`

4. Manually commit and force push

Repeat for both your local folders:
```
cd magazine-before-2019-01-01
git add .
git commit -m "init after split"
git remote add git@github.com:republik-dev/before-2019-01-01.git
git push --set-upstream origin master --force
```

5. Goto publikator and publish the two new docs
