#!/usr/bin/python

import sys
import ConfigParser
import StringIO

class ConfigTest():

    filename="./config_test.conf"

    @classmethod
    def set_key(cls, key, val):
        config = ConfigParser.ConfigParser()
        try:
            with open(cls.filename) as f:
                conf_str = '[config]\n' + f.read()
                conf_fp = StringIO.StringIO(conf_str)
                config.readfp(conf_fp)
        except IOError as e:
            print cls.filename, 'does not exist!'
            return

        config.set('config', str(key), str(val))

        try:
            with open(cls.filename, 'wb') as f:
                conf_items = config.items('config')
                for (key, value) in conf_items:
                    f.write("{0} = {1}\n".format(key, value))
                f.write("\n")
        except IOError as e:
            print e


    @classmethod
    def get_key(cls, key):
        config = ConfigParser.ConfigParser()
        config.read(cls.filename)
        return config.get('config_test',str(key))


def main():
    if len(sys.argv) > 3 and sys.argv[1] == "set":
        ConfigTest.set_key(sys.argv[2],sys.argv[3])
    elif len(sys.argv) > 2 and sys.argv[1] == "get":
        print ConfigTest.get_key(sys.argv[2])

if __name__ == "__main__":
    main()

